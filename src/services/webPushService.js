// WebPushService class loading
import { authenticatedApiCall } from '@/lib/api';

class WebPushService {
  constructor() {
    this.isInitialized = false;
    this.subscription = null;
    this.vapidPublicKey = null;
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'API_URL';
  }

  // Check if web push is supported
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Show notification permission prompt
  async showNotificationPrompt() {
    // WebPushService: Showing notification prompt');
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      // WebPushService: Notification permission result:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  // Initialize web push service
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      if (!this.isSupported()) {
        // WebPushService: Browser does not support web push');
        return;
      }

      await this.getVapidPublicKey();
      await this.registerServiceWorker();
      
      // Add a small delay to ensure user authentication is fully processed
      setTimeout(async () => {
        await this.cleanupExpiredSubscriptions();
      }, 500);

      const hasPermission = await this.checkAndRequestPermissions();
      if (hasPermission) {
        await this.subscribeToPush();
        // WebPushService: Push notifications initialized successfully');
      }

      this.isInitialized = true;
      this.startPermissionChecking();
    } catch (error) {
      // Error:Error initializing web push service:', error);
    }
  }

  // Get VAPID public key from backend
  async getVapidPublicKey() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/notifications/vapid-key`);
      const data = await response.json();
      
      if (data.success) {
        this.vapidPublicKey = data.data.vapidPublicKey;
      } else {
        throw new Error('Failed to get VAPID public key');
      }
    } catch (error) {
      // Error:Error getting VAPID key:', error);
      throw error;
    }
  }

  // Register service worker
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      // Error:Error registering service worker:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if we already have a subscription
      let subscription = await registration.pushManager.getSubscription();
      
      // If no existing subscription, create a new one
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
      } else {
        // Check if existing subscription is still valid by trying to register it
        try {
          await this.registerSubscriptionWithBackend(subscription);
        } catch (error) {
          // If registration fails, create a new subscription
          await subscription.unsubscribe();
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
          });
        }
      }

      this.subscription = subscription;
      await this.registerSubscriptionWithBackend(subscription);
      
    } catch (error) {
      // Error:Error subscribing to push notifications:', error);
      throw error;
    }
  }

  // Register subscription with backend
  async registerSubscriptionWithBackend(subscription) {
    try {
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        return;
      }

      const response = await fetch(`${this.apiBaseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ subscription })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register subscription');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Unregister subscription
  async unregisterSubscription() {
    try {
      // WebPushService: Unregistering subscription');
      
      if (this.subscription) {
        // WebPushService: Unsubscribing from push manager');
        await this.subscription.unsubscribe();
        this.subscription = null;
        // WebPushService: Unsubscribed from push manager');
      }

      const userToken = localStorage.getItem('token');
      if (userToken) {
        // WebPushService: Removing subscription from backend');
        const response = await fetch(`${this.apiBaseUrl}/auth/unregister-push-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
          body: JSON.stringify({ endpoint: this.subscription?.endpoint })
        });
        // WebPushService: Backend unregistration response:', response.status);
      }
    } catch (error) {
      // WebPushService: Error unregistering subscription:', error);
      // Error:Error unregistering subscription:', error);
    }
  }

  // Convert VAPID key to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get current subscription
  async getSubscription() {
    try {
      // WebPushService: Getting current subscription');
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      // WebPushService: Current subscription:', !!subscription);
      return subscription;
    } catch (error) {
      // WebPushService: Error getting subscription:', error);
      return null;
    }
  }

  // Check and request permissions
  async checkAndRequestPermissions() {
    try {
      // WebPushService: Checking notification permissions');
      
      if (!('Notification' in window)) {
        // WebPushService: Notifications not supported');
        return false;
      }

      const permission = Notification.permission;
      // WebPushService: Current permission status:', permission);

      if (permission === 'granted') {
        if (!this.subscription) {
          await this.subscribeToPush();
        } else {
          try {
            await this.registerSubscriptionWithBackend(this.subscription);
          } catch (error) {
            // WebPushService: Subscription validation failed, resubscribing...');
            await this.subscribeToPush();
          }
        }
        return true;
      } else if (permission === 'default') {
        // WebPushService: Requesting notification permission');
        const newPermission = await Notification.requestPermission();
        // WebPushService: Permission request result:', newPermission);
        
        if (newPermission === 'granted') {
          await this.subscribeToPush();
          return true;
        }
      }

      // WebPushService: Notification permission denied');
      return false;
    } catch (error) {
      // WebPushService: Error checking permissions:', error);
      return false;
    }
  }

  // Force resubscribe (unsubscribe then subscribe)
  async forceResubscribe() {
    try {
      // WebPushService: Force resubscribing');
      
      // Unsubscribe first
      if (this.subscription) {
        // WebPushService: Unsubscribing from current subscription');
        await this.subscription.unsubscribe();
        this.subscription = null;
      }

      // Get fresh registration and subscribe
      // WebPushService: Creating new subscription');
      const registration = await navigator.serviceWorker.ready;
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });
      
      this.subscription = newSubscription;
      // WebPushService: New subscription created');
      return newSubscription;
    } catch (error) {
      // WebPushService: Error force resubscribing:', error);
      throw error;
    }
  }

  // Manual resubscription method for users
  async resubscribe() {
    try {
      // WebPushService: Manual resubscription requested');
      
      if (!this.isSupported()) {
        // WebPushService: Web push not supported');
        throw new Error('Web push not supported');
      }

      if (Notification.permission !== 'granted') {
        // WebPushService: Requesting notification permission');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      const newSubscription = await this.forceResubscribe();
      await this.registerResubscriptionWithBackend(newSubscription);
      // WebPushService: Manual resubscription completed');
      return newSubscription;
    } catch (error) {
      // WebPushService: Error in manual resubscription:', error);
      throw error;
    }
  }

  // Register resubscription with backend
  async registerResubscriptionWithBackend(subscription) {
    try {
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        throw new Error('No user token found');
      }

      // WebPushService: Registering resubscription with backend');
      const response = await fetch(`${this.apiBaseUrl}/notifications/resubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ subscription })
      });

      // WebPushService: Resubscription response:', response.status, response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resubscribe');
      }

      const result = await response.json();
      // WebPushService: Resubscription successful:', result);
      return result;
    } catch (error) {
      // WebPushService: Error registering resubscription:', error);
      throw error;
    }
  }

  // Clean up expired subscriptions
  async cleanupExpiredSubscriptions() {
    try {
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        // WebPushService: No user token found, skipping cleanup');
        return;
      }

      // Check if token is valid by trying to decode it
      try {
        const tokenPayload = JSON.parse(atob(userToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          // WebPushService: Token expired, skipping cleanup');
          return;
        }
      } catch (tokenError) {
        // WebPushService: Invalid token format, skipping cleanup');
        return;
      }

      // Skip cleanup for now to avoid 403 errors
      // This can be re-enabled once the backend authentication is properly configured
      // WebPushService: Skipping cleanup to avoid authentication issues');
      return;

      // WebPushService: Cleaning up expired subscriptions');
      try {
        const response = await fetch(`${this.apiBaseUrl}/notifications/cleanup`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        });

        // WebPushService: Cleanup response:', response.status, response.ok);
        
        if (response.ok) {
          const result = await response.json();
          // WebPushService: Cleanup result:', result);
        } else if (response.status === 403) {
          // WebPushService: User not authorized for cleanup, skipping silently');
          return;
        } else {
          // WebPushService: Cleanup failed with status:', response.status);
        }
      } catch (fetchError) {
        // WebPushService: Fetch error during cleanup, skipping silently');
        return;
      }
    } catch (error) {
      // WebPushService: Error cleaning up subscriptions:', error);
    }
  }

  // Start periodic permission checking
  startPermissionChecking() {
    // WebPushService: Starting periodic permission checking');
    
    // Check permissions every 30 seconds
    setInterval(async () => {
      try {
        if (Notification.permission === 'granted' && !this.subscription) {
          // WebPushService: Permission granted but no subscription, resubscribing');
          await this.subscribeToPush();
        }
      } catch (error) {
        // WebPushService: Error in periodic permission check:', error);
      }
    }, 30000);
  }
}

// Create and export singleton instance
const webPushService = new WebPushService();
export default webPushService;