import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getReadNotificationIds,
  getAcceptedNotificationIds,
  markNotificationAsRead,
  markNotificationAsAccepted,
  markAllNotificationsAsAccepted,
  markAllNotificationsAsRead,
  subscribeToNotificationUpdates
} from '../notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('getReadNotificationIds returns empty array when empty or on error', () => {
    expect(getReadNotificationIds()).toEqual([]);

    localStorage.setItem('mchav_read_notification_ids', JSON.stringify(['id1', 'id2']));
    expect(getReadNotificationIds()).toEqual(['id1', 'id2']);

    localStorage.setItem('mchav_read_notification_ids', 'invalid-json{{{');
    expect(getReadNotificationIds()).toEqual([]);
  });

  it('getAcceptedNotificationIds returns empty array when empty or on error', () => {
    expect(getAcceptedNotificationIds()).toEqual([]);

    localStorage.setItem('mchav_accepted_nubi_alert_ids', JSON.stringify(['a1']));
    expect(getAcceptedNotificationIds()).toEqual(['a1']);

    localStorage.setItem('mchav_accepted_nubi_alert_ids', 'invalid-json{{{');
    expect(getAcceptedNotificationIds()).toEqual([]);
  });

  it('markNotificationAsRead handles null, new id, and existing id', () => {
    markNotificationAsRead(null);
    expect(getReadNotificationIds()).toEqual([]);

    markNotificationAsRead('id10');
    expect(getReadNotificationIds()).toEqual(['id10']);

    // Call again with same id
    markNotificationAsRead('id10');
    expect(getReadNotificationIds()).toEqual(['id10']);

    // Error handling branch
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    markNotificationAsRead('id20');
  });

  it('markNotificationAsAccepted marks as accepted and read', () => {
    markNotificationAsAccepted(null);
    expect(getAcceptedNotificationIds()).toEqual([]);

    markNotificationAsAccepted('alert1');
    expect(getAcceptedNotificationIds()).toEqual(['alert1']);
    expect(getReadNotificationIds()).toEqual(['alert1']);

    // Call again with existing id
    markNotificationAsAccepted('alert1');
    expect(getAcceptedNotificationIds()).toEqual(['alert1']);

    // Error branch
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Storage full');
    });
    markNotificationAsAccepted('alert2');
  });

  it('markAllNotificationsAsAccepted handles empty and multiple ids', () => {
    markAllNotificationsAsAccepted([]);
    markAllNotificationsAsAccepted(null);
    expect(getAcceptedNotificationIds()).toEqual([]);

    markAllNotificationsAsAccepted(['a1', 'a2']);
    expect(getAcceptedNotificationIds()).toEqual(['a1', 'a2']);
    expect(getReadNotificationIds()).toEqual(['a1', 'a2']);

    // Overlapping
    markAllNotificationsAsAccepted(['a2', 'a3']);
    expect(getAcceptedNotificationIds()).toEqual(['a1', 'a2', 'a3']);

    // Error branch
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Storage failure');
    });
    markAllNotificationsAsAccepted(['a4']);
  });

  it('markAllNotificationsAsRead handles empty and multiple ids', () => {
    markAllNotificationsAsRead([]);
    markAllNotificationsAsRead(null);
    expect(getReadNotificationIds()).toEqual([]);

    markAllNotificationsAsRead(['r1', 'r2']);
    expect(getReadNotificationIds()).toEqual(['r1', 'r2']);

    // Re-adding existing
    markAllNotificationsAsRead(['r1', 'r2']);
    expect(getReadNotificationIds()).toEqual(['r1', 'r2']);

    // Error branch
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Fail');
    });
    markAllNotificationsAsRead(['r3']);
  });

  it('subscribeToNotificationUpdates listens and unsubscribes cleanly', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToNotificationUpdates(callback);

    markNotificationAsRead('event-id');
    expect(callback).toHaveBeenCalledWith(['event-id'], { updatedId: 'event-id' });

    window.dispatchEvent(new Event('storage'));
    expect(callback).toHaveBeenCalledTimes(2);

    unsubscribe();
    markNotificationAsRead('event-id-2');
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
