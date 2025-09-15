class WebPushService {
  constructor() {
    this.isInitialized = false;
    this.subscription = null;
    this.vapidPublicKey = null;
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }

  // Check if web push is supported
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Show custom notification prompt
  showNotificationPrompt() {
    // Create a custom notification prompt
    const prompt = document.createElement('div');
    prompt.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;
    
    prompt.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <div style="width: 24px; height: 24px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
          🔔
        </div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Enable Notifications</h3>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.4; opacity: 0.9;">
        Stay updated with important trading alerts and challenge notifications!
      </p>
      <div style="display: flex; gap: 8px;">
        <button id="enable-notifications" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        ">Enable</button>
        <button id="dismiss-prompt" style="
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        ">Later</button>
      </div>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(prompt);
    
    // Add event listeners
    prompt.querySelector('#enable-notifications').addEventListener('click', () => {
      document.body.removeChild(prompt);
      document.head.removeChild(style);
    });
    
    prompt.querySelector('#dismiss-prompt').addEventListener('click', () => {
      document.body.removeChild(prompt);
      document.head.removeChild(style);
    });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(prompt)) {
        document.body.removeChild(prompt);
        document.head.removeChild(style);
      }
    }, 10000);
  }

  // Initialize web push service
  async initialize() {
    if (this.isInitialized) {
      console.log('🔄 Web push service already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing web push service...');
      
      if (!this.isSupported()) {
        console.log('❌ This browser does not support push notifications');
        return;
      }

      console.log('✅ Browser supports push notifications');

      // Get VAPID public key
      await this.getVapidPublicKey();

      // Register service worker
      await this.registerServiceWorker();

      // Subscribe to push notifications
      await this.subscribeToPush();

      this.isInitialized = true;
      console.log('✅ Web push service initialized successfully');
      
      // Start periodic permission checking
      this.startPermissionChecking();
    } catch (error) {
      console.error('❌ Error initializing web push service:', error);
    }
  }

  // Get VAPID public key from backend
  async getVapidPublicKey() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/notifications/vapid-key`);
      const data = await response.json();
      
      if (data.success) {
        this.vapidPublicKey = data.data.vapidPublicKey;
        console.log('✅ VAPID public key retrieved');
      } else {
        throw new Error('Failed to get VAPID public key');
      }
    } catch (error) {
      console.error('❌ Error getting VAPID public key:', error);
      throw error;
    }
  }

  // Register service worker
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    try {
      console.log('🔄 Starting push subscription process...');
      
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      console.log('📋 Existing subscription:', subscription ? 'Found' : 'None');
      
      // If there's an existing subscription, unsubscribe first to avoid conflicts
      if (subscription) {
        console.log('🔄 Unsubscribing from existing subscription to avoid conflicts...');
        try {
          await subscription.unsubscribe();
          console.log('✅ Existing subscription unsubscribed');
          subscription = null;
        } catch (unsubError) {
          console.log('⚠️ Could not unsubscribe existing subscription:', unsubError.message);
        }
      }
      
      if (!subscription) {
        console.log('🆕 Creating new push subscription...');
        
        // Check current permission status
        let permission = Notification.permission;
        console.log('🔔 Current notification permission:', permission);
        
        // If permission is not granted, request it
        if (permission !== 'granted') {
          console.log('🔔 Requesting notification permission...');
          permission = await Notification.requestPermission();
          console.log('🔔 Notification permission result:', permission);
        }
        
        // If still not granted, try to show a custom prompt
        if (permission !== 'granted') {
          console.log('⚠️ Permission not granted, showing custom prompt...');
          this.showNotificationPrompt();
          
          // Wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 2000));
          permission = await Notification.requestPermission();
          console.log('🔔 Second permission request result:', permission);
        }
        
        // If still not granted, log warning but continue (user can enable later)
        if (permission !== 'granted') {
          console.warn('⚠️ Notification permission not granted. User can enable later in browser settings.');
          return; // Don't throw error, just skip subscription
        }

        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
        console.log('✅ New push subscription created');
      } else {
        console.log('♻️  Using existing subscription');
      }

      this.subscription = subscription;
      console.log('💾 Push subscription saved');

      // Register subscription with backend
      await this.registerSubscriptionWithBackend(subscription);
      
    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      
      // If it's a subscription conflict error, try to resolve it
      if (error.message.includes('different applicationServerKey') || error.message.includes('already exists')) {
        console.log('🔄 Detected subscription conflict, attempting to resolve...');
        try {
          await this.forceResubscribe();
        } catch (resubError) {
          console.error('❌ Failed to resolve subscription conflict:', resubError.message);
        }
      }
      
      // Don't throw error, just log it - we don't want to break the login flow
      console.log('ℹ️ Push notifications will be available when user grants permission');
    }
  }

  // Register subscription with backend
  async registerSubscriptionWithBackend(subscription) {
    try {
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        console.log('⚠️  No user token found, skipping subscription registration');
        return;
      }

      console.log('🔄 Registering push subscription with backend...');

      const response = await fetch(`${this.apiBaseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ subscription })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Push subscription registered successfully:', data.message);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to register push subscription:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Error registering push subscription:', error);
    }
  }

  // Unregister subscription
  async unregisterSubscription() {
    try {
      if (!this.subscription) {
        console.log('⚠️  No subscription to unregister');
        return;
      }

      const userToken = localStorage.getItem('token');
      if (!userToken) {
        console.log('⚠️  No user token found, skipping subscription unregistration');
        return;
      }

      console.log('🔄 Unregistering push subscription...');

      const response = await fetch(`${this.apiBaseUrl}/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ endpoint: this.subscription.endpoint })
      });

      if (response.ok) {
        console.log('✅ Push subscription unregistered successfully');
        this.subscription = null;
        this.isInitialized = false;
      } else {
        console.error('❌ Failed to unregister push subscription');
      }
    } catch (error) {
      console.error('❌ Error unregistering push subscription:', error);
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
  getSubscription() {
    return this.subscription;
  }

  // Check and re-request permissions periodically
  async checkAndRequestPermissions() {
    try {
      if (!this.isSupported()) {
        return false;
      }

      const permission = Notification.permission;
      console.log('🔔 Current permission status:', permission);

      if (permission === 'granted') {
        // Already granted, ensure we have a subscription
        if (!this.subscription) {
          await this.subscribeToPush();
        }
        return true;
      } else if (permission === 'default') {
        // Not asked yet, request permission
        console.log('🔔 Requesting notification permission...');
        const newPermission = await Notification.requestPermission();
        console.log('🔔 Permission result:', newPermission);
        
        if (newPermission === 'granted') {
          await this.subscribeToPush();
          return true;
        }
      } else if (permission === 'denied') {
        // Permission denied, show custom prompt
        console.log('⚠️ Permission denied, showing custom prompt...');
        this.showNotificationPrompt();
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return false;
    }
  }

  // Force resubscribe by clearing all existing subscriptions
  async forceResubscribe() {
    try {
      console.log('🔄 Force resubscribing to resolve conflicts...');
      
      const registration = await navigator.serviceWorker.ready;
      
      // Get all existing subscriptions and unsubscribe from them
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('🔄 Unsubscribing from existing subscription...');
        await existingSubscription.unsubscribe();
        console.log('✅ Existing subscription unsubscribed');
      }
      
      // Wait a moment for the unsubscribe to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new subscription
      console.log('🆕 Creating fresh push subscription...');
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });
      
      console.log('✅ Fresh push subscription created');
      this.subscription = newSubscription;
      
      // Register with backend
      await this.registerSubscriptionWithBackend(newSubscription);
      
      return newSubscription;
    } catch (error) {
      console.error('❌ Error in force resubscribe:', error);
      throw error;
    }
  }

  // Start periodic permission checking
  startPermissionChecking() {
    // Check permissions every 30 seconds
    setInterval(() => {
      this.checkAndRequestPermissions();
    }, 30000);

    // Also check when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkAndRequestPermissions();
      }
    });
  }


}

// Create and export singleton instance
const webPushService = new WebPushService();
export default webPushService;
