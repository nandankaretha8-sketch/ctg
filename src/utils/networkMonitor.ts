// Network monitoring utility for handling connection issues
class NetworkMonitor {
  private isOnline = navigator.onLine;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      console.log('Network connection restored');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
      console.log('Network connection lost');
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  public async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Check if it's a network error
        if (this.isNetworkError(error)) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`Network error, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await this.delay(delay);
        } else {
          // Non-network error, don't retry
          break;
        }
      }
    }

    throw lastError!;
  }

  private isNetworkError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';
    
    return (
      name === 'networkerror' ||
      name === 'typeerror' ||
      message.includes('failed to fetch') ||
      message.includes('network error') ||
      message.includes('connection') ||
      message.includes('timeout')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();
export default networkMonitor;
