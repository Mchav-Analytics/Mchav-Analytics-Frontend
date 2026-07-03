import os
import secrets
import hmac
import hashlib
from fastapi import FastAPI, HTTPException, Request, Depends, Response, BackgroundTasks
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import httpx
import asyncio

import models
from database import engine, get_db
from sync_service import run_jira_sync_task

load_dotenv(override=True)

# Crear tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MCHAV Analytics API", description="API para la integración con Jira")

# Configuración de CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173").strip(),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Importante para enviar cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables de entorno
CLIENT_ID = os.getenv("JIRA_CLIENT_ID", "").strip()
CLIENT_SECRET = os.getenv("JIRA_CLIENT_SECRET", "").strip()
CALLBACK_URL = os.getenv("JIRA_CALLBACK_URL", "").strip()

SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "mchav_default_secret_key_123456").encode()

def sign_session_id(user_id: int) -> str:
    user_id_str = str(user_id)
    signature = hmac.new(SESSION_SECRET_KEY, user_id_str.encode(), hashlib.sha256).hexdigest()
    return f"{user_id_str}.{signature}"

def verify_session_id(signed_value: str) -> int | None:
    if not signed_value:
        return None
    try:
        user_id_str, signature = signed_value.split(".", 1)
        expected_signature = hmac.new(SESSION_SECRET_KEY, user_id_str.encode(), hashlib.sha256).hexdigest()
        if hmac.compare_digest(signature, expected_signature):
            return int(user_id_str)
    except Exception:
        pass
    return None

# URLs de Atlassian
AUTHORIZATION_BASE_URL = "https://auth.atlassian.com/authorize"
TOKEN_URL = "https://auth.atlassian.com/oauth/token"
RESOURCES_URL = "https://api.atlassian.com/oauth/token/accessible-resources"

# Diccionario temporal para guardar el estado (CSRF protection)
oauth_states = set()

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de MCHAV Analytics"}

@app.get("/api/auth/me")
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    rol_nombre = user.rol.nombre_rol if user.rol else None
    
    return {
        "id_usuario": user.id_usuario,
        "email": user.email,
        "nombre": user.nombre,
        "id_rol": user.id_rol,
        "rol": rol_nombre,
        "activo": user.activo,
        "jira_account_id": user.jira_account_id,
        "cloud_id": user.cloud_id
    }


@app.get("/api/auth/login")
def login():
    if not CLIENT_ID:
        raise HTTPException(status_code=500, detail="JIRA_CLIENT_ID no configurado")

    state = secrets.token_urlsafe(16)
    oauth_states.add(state)
    
    scopes = "read:jira-user read:jira-work offline_access"
    
    params = {
        "audience": "api.atlassian.com",
        "client_id": CLIENT_ID,
        "scope": scopes,
        "redirect_uri": CALLBACK_URL,
        "state": state,
        "response_type": "code",
        "prompt": "consent"
    }
    
    query_string = "&".join([f"{k}={v.replace(' ', '%20')}" for k, v in params.items()])
    authorization_url = f"{AUTHORIZATION_BASE_URL}?{query_string}"
    
    return RedirectResponse(url=authorization_url)

@app.get("/api/auth/callback")
async def callback(code: str, state: str, response: Response, db: Session = Depends(get_db)):
    if state not in oauth_states:
        raise HTTPException(status_code=400, detail="Estado (State) inválido o expirado. Intente iniciar sesión nuevamente.")
    oauth_states.remove(state)
    
    # 1. Intercambiar código por Access Token
    data = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "redirect_uri": CALLBACK_URL
    }
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post(TOKEN_URL, json=data)
        if token_res.status_code != 200:
            error_details = token_res.text
            print("Error details:", error_details)
            raise HTTPException(status_code=token_res.status_code, detail=f"No se pudo obtener el token de Atlassian. Error: {error_details}")
            
        tokens = token_res.json()
        access_token = tokens.get("access_token")
        refresh_token = tokens.get("refresh_token")
        
        # 2. Obtener el cloudId del usuario
        headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
        resources_res = await client.get(RESOURCES_URL, headers=headers)
        
        if resources_res.status_code != 200:
            raise HTTPException(status_code=resources_res.status_code, detail="No se pudieron obtener los recursos accesibles de Atlassian")
            
        resources = resources_res.json()
        if not resources:
            raise HTTPException(status_code=400, detail="El usuario no tiene acceso a ningún sitio de Jira")
            
        cloud_id = resources[0]["id"]
        
        # 2.5 Obtener datos del perfil de usuario de Jira (myself)
        myself_url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/myself"
        myself_res = await client.get(myself_url, headers=headers)
        if myself_res.status_code != 200:
            raise HTTPException(status_code=myself_res.status_code, detail=f"No se pudo obtener el perfil de usuario de Jira: {myself_res.text}")
            
        profile = myself_res.json()
        jira_account_id = profile.get("accountId")
        email = profile.get("emailAddress")
        nombre = profile.get("displayName")
        
        # 3. Guardar/Actualizar en PostgreSQL buscando por el accountId único
        user = db.query(models.User).filter(models.User.jira_account_id == jira_account_id).first()
        if not user:
            user = models.User(
                jira_account_id=jira_account_id,
                email=email,
                nombre=nombre,
                access_token=access_token,
                refresh_token=refresh_token,
                cloud_id=cloud_id
            )
            db.add(user)
        else:
            user.email = email
            user.nombre = nombre
            user.access_token = access_token
            user.refresh_token = refresh_token
            user.cloud_id = cloud_id
            
        db.commit()
        db.refresh(user)
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").strip()
        
        # 4. Redirigir al frontend y setear cookie firmada
        redirect = RedirectResponse(url=f"{frontend_url}/dashboard?login=success")
        signed_session = sign_session_id(user.id_usuario)
        redirect.set_cookie(key="session_id", value=signed_session, httponly=True, samesite='lax', max_age=3600*24)
        
        return redirect

@app.get("/api/jira/metrics")
async def get_jira_metrics(request: Request, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    base_jira_url = f"https://api.atlassian.com/ex/jira/{user.cloud_id}/rest/api/3"
    headers = {
        "Authorization": f"Bearer {user.access_token}",
        "Accept": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # Hacemos las 4 peticiones en paralelo para mayor rapidez
            projects_req = client.get(f"{base_jira_url}/project", headers=headers)
            done_req = client.get(f"{base_jira_url}/search?jql=statusCategory=Done&maxResults=0", headers=headers)
            progress_req = client.get(f"{base_jira_url}/search?jql=statusCategory=\"In Progress\"&maxResults=0", headers=headers)
            bugs_req = client.get(f"{base_jira_url}/search?jql=issuetype=Bug AND priority=Highest&maxResults=0", headers=headers)
            
            projects_res, done_res, progress_res, bugs_res = await asyncio.gather(
                projects_req, done_req, progress_req, bugs_req
            )
            
            # Verificamos si los tokens expiraron (401). (Idealmente, usaríamos el refresh_token aquí)
            if projects_res.status_code == 401:
                raise HTTPException(status_code=401, detail="Token expirado. Por favor inicie sesión nuevamente.")
                
            active_projects = len(projects_res.json()) if projects_res.status_code == 200 else 0
            
            done_data = done_res.json() if done_res.status_code == 200 else {}
            progress_data = progress_res.json() if progress_res.status_code == 200 else {}
            bugs_data = bugs_res.json() if bugs_res.status_code == 200 else {}
            
            return {
                "active_projects": active_projects,
                "completed_tickets": done_data.get("total", 0),
                "in_progress_tickets": progress_data.get("total", 0),
                "critical_bugs": bugs_data.get("total", 0)
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jira/sync")
async def trigger_jira_sync(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    background_tasks.add_task(run_jira_sync_task, user.id_usuario)
    return {"message": "Sincronización iniciada en segundo plano"}

@app.get("/api/jira/sync/logs")
async def get_sync_logs(request: Request, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    logs = db.query(models.LogsSincronizacion).order_by(models.LogsSincronizacion.fecha_ejecucion.desc()).limit(20).all()
    return logs

@app.get("/api/projects/{proyecto_id}/kpis")
async def get_project_kpis(proyecto_id: str, request: Request, sprint_id: str = None, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    query = db.query(models.KpisHistoricos).filter(models.KpisHistoricos.id_proyecto == proyecto_id)
    if sprint_id:
        query = query.filter(models.KpisHistoricos.id_sprint == sprint_id)
        
    kpis = query.order_by(models.KpisHistoricos.fecha_calculo.asc()).all()
    return kpis

@app.get("/api/projects")
async def get_projects(request: Request, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    projects = db.query(models.Proyecto).all()
    return projects

@app.get("/api/projects/{proyecto_id}/sprints")
async def get_project_sprints(proyecto_id: str, request: Request, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    sprints = db.query(models.Sprint).filter(models.Sprint.id_proyecto == proyecto_id).all()
    return sprints

@app.get("/api/projects/{proyecto_id}/statuses")
async def get_project_unique_statuses(proyecto_id: str, request: Request, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    statuses = db.query(models.Issue.status_actual).filter(models.Issue.id_proyecto == proyecto_id).distinct().all()
    transitions_statuses_new = db.query(models.TransicionEstadoIssue.estado_nuevo).join(models.Issue).filter(models.Issue.id_proyecto == proyecto_id).distinct().all()
    transitions_statuses_prev = db.query(models.TransicionEstadoIssue.estado_anterior).join(models.Issue).filter(models.Issue.id_proyecto == proyecto_id).distinct().all()
    
    unique_statuses = set()
    for s in statuses:
        if s[0]: unique_statuses.add(s[0])
    for s in transitions_statuses_new:
        if s[0]: unique_statuses.add(s[0])
    for s in transitions_statuses_prev:
        if s[0]: unique_statuses.add(s[0])
        
    return sorted(list(unique_statuses))

@app.get("/api/projects/{proyecto_id}/mappings")
async def get_project_mappings(proyecto_id: str, request: Request, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    mappings = db.query(models.MapeoEstado).filter(models.MapeoEstado.id_proyecto == proyecto_id).all()
    return mappings

@app.post("/api/projects/{proyecto_id}/mappings")
async def save_project_mappings(proyecto_id: str, mappings_data: list[dict], request: Request, db: Session = Depends(get_db)):
    signed_session = request.cookies.get("session_id")
    if not signed_session:
        raise HTTPException(status_code=401, detail="No autenticado")
        
    user_id = verify_session_id(signed_session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")
        
    user = db.query(models.User).filter(models.User.id_usuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
    db.query(models.MapeoEstado).filter(models.MapeoEstado.id_proyecto == proyecto_id).delete()
    
    for item in mappings_data:
        mapping = models.MapeoEstado(
            id_proyecto=proyecto_id,
            estado_jira=item.get("estado_jira"),
            estado_base=item.get("estado_base")
        )
        db.add(mapping)
        
    db.commit()
    
    from kpi_service import calculate_and_save_kpis
    calculate_and_save_kpis(db, proyecto_id)
    
    return {"message": "Mapeo guardado y KPIs recalculados con éxito"}

@app.post("/api/jira/webhook")
async def jira_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    issue_data = payload.get("issue", {})
    
    if not issue_data:
        return {"status": "ignored", "reason": "no issue data"}
        
    issue_id = str(issue_data.get("id"))
    issue_key = issue_data.get("key")
    fields = issue_data.get("fields", {}) or {}
    project_data = fields.get("project", {}) or {}
    project_id = str(project_data.get("id"))
    
    db_project = db.query(models.Proyecto).filter(models.Proyecto.id_proyecto == project_id).first()
    if not db_project:
        return {"status": "ignored", "reason": f"project {project_id} not synced"}
        
    summary = fields.get("summary", "")
    status_actual = fields.get("status", {}).get("name", "Unknown")
    
    from datetime import datetime
    def parse_iso(date_str):
        if not date_str:
            return None
        clean_str = date_str.replace("Z", "+00:00")
        if "+" in clean_str and len(clean_str.split("+")[-1]) == 4:
            clean_str = clean_str[:-2] + ":" + clean_str[-2:]
        try:
            return datetime.fromisoformat(clean_str)
        except ValueError:
            return None
            
    created_at = parse_iso(fields.get("created"))
    resolved_at = parse_iso(fields.get("resolutiondate"))
    
    story_points = 0.0
    sprints_raw = None
    
    for key, value in fields.items():
        if key.startswith("customfield_"):
            if isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict) and "sprint" in str(value[0].get("self", "")).lower():
                sprints_raw = value
            elif isinstance(value, dict) and "sprint" in str(value.get("self", "")).lower():
                sprints_raw = value
            elif isinstance(value, (int, float)):
                story_points = float(value)
                
    active_sprint_id = None
    associated_sprint_ids = []
    
    if isinstance(sprints_raw, list):
        for s_raw in sprints_raw:
            if isinstance(s_raw, dict):
                s_id = str(s_raw.get("id"))
                associated_sprint_ids.append(s_id)
                if s_raw.get("state") == "active":
                    active_sprint_id = s_id
        if not active_sprint_id and associated_sprint_ids:
            active_sprint_id = associated_sprint_ids[-1]
    elif isinstance(sprints_raw, dict):
        active_sprint_id = str(sprints_raw.get("id"))
        associated_sprint_ids.append(active_sprint_id)
        
    if active_sprint_id:
        sprint_exists = db.query(models.Sprint).filter(models.Sprint.id_sprint == active_sprint_id).first()
        if not sprint_exists:
            sprint_exists = models.Sprint(
                id_sprint=active_sprint_id,
                id_proyecto=project_id,
                nombre=sprints_raw.get("name") if isinstance(sprints_raw, dict) else "Sprint Sincronizado",
                estado=sprints_raw.get("state") if isinstance(sprints_raw, dict) else "active"
            )
            db.add(sprint_exists)
            
    db_issue = db.query(models.Issue).filter(models.Issue.id_jira == issue_id).first()
    if not db_issue:
        db_issue = models.Issue(
            id_jira=issue_id,
            key_issue=issue_key,
            id_proyecto=project_id,
            id_sprint=active_sprint_id,
            summary=summary,
            status_actual=status_actual,
            story_points=story_points,
            created_at=created_at,
            resolved_at=resolved_at
        )
        db.add(db_issue)
    else:
        db_issue.key_issue = issue_key
        db_issue.id_sprint = active_sprint_id
        db_issue.summary = summary
        db_issue.status_actual = status_actual
        if story_points > 0:
            db_issue.story_points = story_points
        db_issue.created_at = created_at
        db_issue.resolved_at = resolved_at
        
    db_issue.sprints.clear()
    for s_id in associated_sprint_ids:
        sprint_obj = db.query(models.Sprint).filter(models.Sprint.id_sprint == s_id).first()
        if sprint_obj:
            db_issue.sprints.append(sprint_obj)
            
    db.query(models.TransicionEstadoIssue).filter(models.TransicionEstadoIssue.id_jira == issue_id).delete()
    
    changelog = payload.get("changelog", {}) or {}
    histories = changelog.get("histories", []) or []
    
    for history in histories:
        history_date = parse_iso(history.get("created"))
        items = history.get("items", []) or []
        for item in items:
            if item.get("field") == "status":
                estado_anterior = item.get("fromString")
                estado_nuevo = item.get("toString")
                
                db_transition = models.TransicionEstadoIssue(
                    id_jira=issue_id,
                    estado_anterior=estado_anterior,
                    estado_nuevo=estado_nuevo,
                    fecha_cambio=history_date
                )
                db.add(db_transition)
                
    db.commit()
    
    from kpi_service import calculate_and_save_kpis
    calculate_and_save_kpis(db, project_id)
    
    return {"status": "success", "issue": issue_key}
