import { LocalNotifications } from '@capacitor/local-notifications';

export interface ScheduledNotification {
  id: number;
  title: string;
  body: string;
  scheduleAt?: Date;
  actionTypeId?: string;
  extra?: Record<string, any>;
}

export class NotificationService {
  private static notificationId = 1;

  static async requestPermission(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(notification: ScheduledNotification): Promise<void> {
    try {
      const notificationId = notification.id || this.notificationId++;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: notification.title,
            body: notification.body,
            schedule: notification.scheduleAt
              ? {
                  at: notification.scheduleAt,
                }
              : undefined,
            smallIcon: 'ic_stat_icon_config_sample',
            largeBody: notification.body,
            extra: {
              actionTypeId: notification.actionTypeId,
              ...notification.extra,
            },
          },
        ],
      });

      console.log(`[Notification] Scheduled: ${notification.title}`);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  static async cancelNotification(id: number): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      console.log(`[Notification] Cancelled: ${id}`);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await LocalNotifications.cancelAll();
      console.log('[Notification] Cancelled all');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  static onNotificationClicked(callback: (notification: any) => void): void {
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      callback(notification);
    });
  }

  static onNotificationReceived(callback: (notification: any) => void): void {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      callback(notification);
    });
  }
}
