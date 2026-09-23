// ============================================================================
// SERVICIO GLOBAL DE ESTADO Y PERSISTENCIA DE NOTIFICACIONES
// Sincronización en tiempo real entre todas las vistas de la aplicación
// ============================================================================

const STORAGE_KEY = 'mchav_read_notification_ids';
const ACCEPTED_STORAGE_KEY = 'mchav_accepted_nubi_alert_ids';
const NOTIFICATION_EVENT = 'mchav-notifications-updated';

/**
 * Obtiene el conjunto de IDs de notificaciones leídas almacenadas.
 */
export function getReadNotificationIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error al leer notificaciones de localStorage:', err);
    return [];
  }
}

/**
 * Obtiene el conjunto de IDs de alertas aceptadas almacenadas.
 */
export function getAcceptedNotificationIds() {
  try {
    const raw = localStorage.getItem(ACCEPTED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error al leer alertas aceptadas de localStorage:', err);
    return [];
  }
}

/**
 * Marca una notificación individual como leída y notifica a todas las vistas.
 */
export function markNotificationAsRead(id) {
  if (!id) return;
  try {
    const current = getReadNotificationIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { updatedId: id } }));
    }
  } catch (err) {
    console.error('Error al guardar notificación leída:', err);
  }
}

/**
 * Marca una alerta como ACEPTADA (y leída) de forma permanente en localStorage.
 */
export function markNotificationAsAccepted(id) {
  if (!id) return;
  try {
    // 1. Guardar en aceptadas
    const accepted = getAcceptedNotificationIds();
    const updatedAccepted = accepted.includes(id) ? accepted : [...accepted, id];
    localStorage.setItem(ACCEPTED_STORAGE_KEY, JSON.stringify(updatedAccepted));

    // 2. Marcar también como leída
    const read = getReadNotificationIds();
    const updatedRead = read.includes(id) ? read : [...read, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRead));

    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { acceptedId: id } }));
  } catch (err) {
    console.error('Error al marcar alerta como aceptada:', err);
  }
}

/**
 * Marca múltiples alertas como ACEPTADAS simultáneamente.
 */
export function markAllNotificationsAsAccepted(ids = []) {
  if (!ids || ids.length === 0) return;
  try {
    const accepted = getAcceptedNotificationIds();
    const newAccepted = ids.filter(id => !accepted.includes(id));
    const updatedAccepted = [...accepted, ...newAccepted];
    localStorage.setItem(ACCEPTED_STORAGE_KEY, JSON.stringify(updatedAccepted));

    const read = getReadNotificationIds();
    const newRead = ids.filter(id => !read.includes(id));
    const updatedRead = [...read, ...newRead];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRead));

    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { acceptedIds: ids } }));
  } catch (err) {
    console.error('Error al marcar todas las alertas como aceptadas:', err);
  }
}

/**
 * Marca múltiples notificaciones como leídas simultáneamente.
 */
export function markAllNotificationsAsRead(ids = []) {
  if (!ids || ids.length === 0) return;
  try {
    const current = getReadNotificationIds();
    const newIds = ids.filter(id => !current.includes(id));
    if (newIds.length > 0) {
      const updated = [...current, ...newIds];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { updatedIds: newIds } }));
    }
  } catch (err) {
    console.error('Error al marcar todas como leídas:', err);
  }
}

/**
 * Suscribe un callback a las actualizaciones de notificaciones leídas en tiempo real.
 */
export function subscribeToNotificationUpdates(callback) {
  const handler = (event) => {
    callback(getReadNotificationIds(), event.detail);
  };
  window.addEventListener(NOTIFICATION_EVENT, handler);
  window.addEventListener('storage', handler); // Para soporte multi-pestana
  return () => {
    window.removeEventListener(NOTIFICATION_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
