// Función auxiliar para iniciar sesión usando localStorage y omitir la pantalla de login
export async function loginViaLocalStorage(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('mock_user_session', JSON.stringify({
      id: 1,
      nombre: 'Admin Test',
      rol: 'ADMIN',
      email: 'admin@mchav.com'
    }));
    window.localStorage.setItem('custom_user_projects', JSON.stringify([
      { id: 'PROJ-01', key: 'PROJ-01', name: 'Proyecto Test', progreso: 50, color: '#000000', tasksCompleted: 5, tasksTotal: 10 }
    ]));
  });
  // Navegar directamente al dashboard ahora que "iniciamos sesión"
  await page.goto('/dashboard');
}
