import { useStudyReminders } from '@/hooks/useStudyReminders';
import { NotificationService } from '@/lib/NotificationInitializer';
import React, { useEffect } from 'react';

const NotificationInitializer: React.FC = () => {
  useStudyReminders();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Vérifie d'abord l'état de la permission navigateur (pour le web)
        let permission: NotificationPermission | undefined;
        if (typeof window !== 'undefined' && 'Notification' in window) {
          permission = window.Notification.permission;
        }

        if (permission === 'denied') {
          console.warn('[Notifications] Permission denied by user/browser.');
          return;
        }

        // App native : demande la permission via le service (Capacitor)
        const permissionGranted = await NotificationService.requestPermission();
        if (!permissionGranted) {
          console.warn('[Notifications] Permission denied (native or browser)');
          return;
        }

        console.log('[Notifications] Initialized with permissions granted');

        // Set up listeners
        NotificationService.onNotificationClicked((notification) => {
          console.log('[Notification] Clicked:', notification);
          const actionTypeId = notification.notification.extra?.actionTypeId;

          // Handle navigation based on action type
          if (actionTypeId === 'study-reminder') {
            // Could dispatch event or navigate to studies view
            const event = new CustomEvent('notification:study-reminder', {
              detail: notification.notification.extra,
            });
            window.dispatchEvent(event);
          }
        });

        NotificationService.onNotificationReceived((notification) => {
          console.log('[Notification] Received:', notification);
        });
      } catch (error) {
        console.error('[Notifications] Initialization failed:', error);
      }
    };

    initializeNotifications();
  }, []);

  return null;
};

export default NotificationInitializer;
