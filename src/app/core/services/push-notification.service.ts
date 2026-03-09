import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private swPush = inject(SwPush);

  constructor() {
    this.requestPermissions();
  }

  async requestPermissions() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Permiso:', permission);
    }
  }

  schedulePickupNotification(petName: string, returnDate: string) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log(`Programando aviso del SW...`);

        setTimeout(() => {
          registration.showNotification(`🐾 ¡Es hora de recoger a ${petName}!`, {
            body: `La estadía en la guardería hasta el ${returnDate} ha finalizado.`,
            icon: '/assets/icons/icon-192x192.png',
            vibrate: [200, 100, 200],
            requireInteraction: true,
          } as any);
        }, 5000);
      });
    }
  }
}
