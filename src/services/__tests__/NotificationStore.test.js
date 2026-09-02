import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotificationUpdates
} from '../notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('getReadNotificationIds returns empty array initially', () => {
    const ids = getReadNotificationIds();
    expect(ids).toEqual([]);
  });

  it('getReadNotificationIds handles invalid JSON gracefully', () => {
    localStorage.setItem('mchav_read_notification_ids', 'invalid-json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const ids = getReadNotificationIds();
    
    expect(ids).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('markNotificationAsRead adds an ID and dispatches event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    
    markNotificationAsRead('notif-1');
    
    const ids = getReadNotificationIds();
    expect(ids).toEqual(['notif-1']);
    
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.type).toBe('mchav-notifications-updated');
    expect(event.detail).toEqual({ updatedId: 'notif-1' });
  });

  it('markNotificationAsRead does not duplicate IDs', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    
    markNotificationAsRead('notif-1');
    markNotificationAsRead('notif-1');
    
    const ids = getReadNotificationIds();
    expect(ids).toEqual(['notif-1']);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it('markNotificationAsRead does nothing if id is empty', () => {
    markNotificationAsRead(null);
    expect(getReadNotificationIds()).toEqual([]);
  });
  
  it('markNotificationAsRead handles localStorage errors gracefully', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    markNotificationAsRead('notif-1');
    
    expect(consoleSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('markAllNotificationsAsRead adds multiple IDs and dispatches event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    
    markAllNotificationsAsRead(['notif-1', 'notif-2']);
    
    const ids = getReadNotificationIds();
    expect(ids).toEqual(['notif-1', 'notif-2']);
    
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.type).toBe('mchav-notifications-updated');
    expect(event.detail).toEqual({ updatedIds: ['notif-1', 'notif-2'] });
  });

  it('markAllNotificationsAsRead filters out already read IDs', () => {
    markNotificationAsRead('notif-1');
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    
    markAllNotificationsAsRead(['notif-1', 'notif-2']);
    
    const ids = getReadNotificationIds();
    expect(ids).toEqual(['notif-1', 'notif-2']);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.detail).toEqual({ updatedIds: ['notif-2'] });
  });

  it('markAllNotificationsAsRead does nothing if ids array is empty', () => {
    markAllNotificationsAsRead([]);
    expect(getReadNotificationIds()).toEqual([]);
  });

  it('markAllNotificationsAsRead handles localStorage errors gracefully', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    markAllNotificationsAsRead(['notif-1']);
    
    expect(consoleSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('subscribeToNotificationUpdates calls callback when event is dispatched', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToNotificationUpdates(callback);
    
    markNotificationAsRead('notif-1');
    
    expect(callback).toHaveBeenCalledWith(['notif-1'], { updatedId: 'notif-1' });
    
    unsubscribe();
    
    markNotificationAsRead('notif-2');
    // Callback should not be called again after unsubscribe
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
