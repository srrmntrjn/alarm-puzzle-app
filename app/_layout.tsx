import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { setupNotificationCategories } from '../services/notificationService';

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Setup notification categories
    setupNotificationCategories();

    // Listen for incoming notifications while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification tap/response
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data.alarmId as string;
      if (alarmId) {
        // Navigate to trigger alarm screen
        router.push({
          pathname: '/trigger-alarm',
          params: { alarmId },
        });
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
