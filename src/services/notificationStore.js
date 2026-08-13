// ============================================================================
// SERVICIO GLOBAL DE ESTADO Y PERSISTENCIA DE NOTIFICACIONES
// Sincronización en tiempo real entre todas las vistas de la aplicación
// ============================================================================

const STORAGE_KEY = 'mchav_read_notification_ids';
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
