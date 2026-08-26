import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotificationUpdates
} from '../NotificationStore';

const STORAGE_KEY = 'mchav_read_notification_ids';
const NOTIFICATION_EVENT = 'mchav-notifications-updated';

describe('NotificationStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('getReadNotificationIds returns empty array when empty', () => {
    expect(getReadNotificationIds()).toEqual([]);
  });

  it('getReadNotificationIds returns stored IDs', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['id1', 'id2']));
    expect(getReadNotificationIds()).toEqual(['id1', 'id2']);
  });

  it('getReadNotificationIds handles JSON parse errors gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(getReadNotificationIds()).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('markNotificationAsRead adds an ID and dispatches event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    
    markNotificationAsRead('id1');
    
    expect(getReadNotificationIds()).toEqual(['id1']);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.type).toBe(NOTIFICATION_EVENT);
    expect(event.detail).toEqual({ updatedId: 'id1' });
  });

  it('markNotificationAsRead ignores if already read', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['id1']));
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    
    markNotificationAsRead('id1');
    
    expect(getReadNotificationIds()).toEqual(['id1']);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('markNotificationAsRead gracefully handles errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage Full');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    markNotificationAsRead('id1');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('markAllNotificationsAsRead adds multiple IDs and dispatches event', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    
    markAllNotificationsAsRead(['id1', 'id2']);
    
    expect(getReadNotificationIds()).toEqual(['id1', 'id2']);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.detail).toEqual({ updatedIds: ['id1', 'id2'] });
  });

  it('markAllNotificationsAsRead ignores already read IDs', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['id1']));
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    
    markAllNotificationsAsRead(['id1', 'id2']);
    
    expect(getReadNotificationIds()).toEqual(['id1', 'id2']);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.detail).toEqual({ updatedIds: ['id2'] });
  });

  it('markAllNotificationsAsRead handles empty array gracefully', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    markAllNotificationsAsRead([]);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('markAllNotificationsAsRead gracefully handles errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage Full');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    markAllNotificationsAsRead(['id1', 'id2']);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('subscribeToNotificationUpdates calls callback on custom event', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToNotificationUpdates(callback);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['id1']));
    const event = new CustomEvent(NOTIFICATION_EVENT, { detail: { updatedId: 'id1' } });
    window.dispatchEvent(event);
    
    expect(callback).toHaveBeenCalledWith(['id1'], { updatedId: 'id1' });
    unsubscribe();
  });

  it('subscribeToNotificationUpdates calls callback on storage event', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToNotificationUpdates(callback);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['id1']));
    const event = new Event('storage');
    window.dispatchEvent(event);
    
    expect(callback).toHaveBeenCalledWith(['id1'], undefined);
    unsubscribe();
  });
});
