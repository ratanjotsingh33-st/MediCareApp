// Offline Manager for handling offline functionality
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingActions = [];
    this.init();
  }

  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/scripts/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          this.setupSync();
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Request notification permission
    this.requestNotificationPermission();

    // Load pending actions from storage
    this.loadPendingActions();
  }

  setupSync() {
    // Set up background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register sync events
        this.registerSync('medication-sync');
        this.registerSync('vitals-sync');
      });
    }
  }

  registerSync(tag) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register(tag)
        .then(() => console.log(`Sync registered: ${tag}`))
        .catch((error) => console.error(`Sync registration failed: ${tag}`, error));
    });
  }

  handleOnline() {
    console.log('App is online');
    this.isOnline = true;
    this.updateOnlineStatus(true);
    this.syncPendingActions();
  }

  handleOffline() {
    console.log('App is offline');
    this.isOnline = false;
    this.updateOnlineStatus(false);
  }

  updateOnlineStatus(isOnline) {
    const statusIndicator = document.getElementById('onlineStatus');
    if (statusIndicator) {
      statusIndicator.className = isOnline ? 'online' : 'offline';
      statusIndicator.textContent = isOnline ? 'Online' : 'Offline';
    }

    // Update body class for styling
    document.body.classList.toggle('offline', !isOnline);
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
  }

  // Queue actions for when back online
  queueAction(action) {
    this.pendingActions.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...action
    });

    this.savePendingActions();

    if (this.isOnline) {
      this.syncPendingActions();
    } else {
      this.showOfflineNotification(action);
    }
  }

  showOfflineNotification(action) {
    let message = 'Action saved for when you\'re back online.';

    switch (action.type) {
      case 'medication_taken':
        message = 'Medication marked as taken. Will sync when online.';
        break;
      case 'vital_logged':
        message = 'Vital signs logged. Will sync when online.';
        break;
      case 'appointment_booked':
        message = 'Appointment booked. Will sync when online.';
        break;
    }

    showToast(message, 'info');
  }

  async syncPendingActions() {
    if (!this.isOnline || this.pendingActions.length === 0) return;

    console.log(`Syncing ${this.pendingActions.length} pending actions`);

    for (const action of this.pendingActions) {
      try {
        await this.syncAction(action);
        this.removePendingAction(action.id);
        showToast('Data synced successfully', 'success');
      } catch (error) {
        console.error('Failed to sync action:', error);
        // Keep failed actions in queue for retry
      }
    }
  }

  async syncAction(action) {
    // This would typically send data to your backend API
    // For now, we'll simulate success
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }

  savePendingActions() {
    localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
  }

  loadPendingActions() {
    const saved = localStorage.getItem('pendingActions');
    if (saved) {
      this.pendingActions = JSON.parse(saved);
    }
  }

  removePendingAction(id) {
    this.pendingActions = this.pendingActions.filter(action => action.id !== id);
    this.savePendingActions();
  }

  // Cache management
  async cacheData(key, data) {
    if ('caches' in window) {
      const cache = await caches.open('medicare-data-v1');
      await cache.put(new Request(`/data/${key}`), new Response(JSON.stringify(data)));
    }
  }

  async getCachedData(key) {
    if ('caches' in window) {
      const cache = await caches.open('medicare-data-v1');
      const response = await cache.match(`/data/${key}`);
      if (response) {
        return response.json();
      }
    }
    return null;
  }

  // Offline data storage
  saveOfflineData(key, data) {
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '{}');
    offlineData[key] = {
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    localStorage.setItem('offlineData', JSON.stringify(offlineData));
  }

  getOfflineData(key) {
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '{}');
    return offlineData[key] || null;
  }

  markDataSynced(key) {
    const offlineData = JSON.parse(localStorage.getItem('offlineData') || '{}');
    if (offlineData[key]) {
      offlineData[key].synced = true;
      localStorage.setItem('offlineData', JSON.stringify(offlineData));
    }
  }

  // Enhanced medication taking with offline support
  takeMedicationOffline(medicationId, time) {
    const action = {
      type: 'medication_taken',
      medicationId,
      time,
      timestamp: new Date().toISOString()
    };

    // Save to local history immediately
    const history = JSON.parse(localStorage.getItem('medication_history') || '[]');
    history.push(action);
    localStorage.setItem('medication_history', JSON.stringify(history));

    // Queue for sync if offline
    if (!this.isOnline) {
      this.queueAction(action);
    }

    return action;
  }

  // Enhanced vitals logging with offline support
  logVitalsOffline(vitalsData) {
    const action = {
      type: 'vital_logged',
      data: vitalsData,
      timestamp: new Date().toISOString()
    };

    // Save to local vitals immediately
    const vitals = JSON.parse(localStorage.getItem('vitalSigns') || '[]');
    vitals.push(vitalsData);
    localStorage.setItem('vitalSigns', JSON.stringify(vitals));

    // Queue for sync if offline
    if (!this.isOnline) {
      this.queueAction(action);
    }

    return action;
  }

  // Check if app can work offline
  isOfflineReady() {
    return 'serviceWorker' in navigator &&
           'caches' in window &&
           'indexedDB' in window;
  }

  // Get offline status info
  getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      isOfflineReady: this.isOfflineReady(),
      pendingActions: this.pendingActions.length,
      serviceWorker: 'serviceWorker' in navigator,
      caches: 'caches' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      notifications: 'Notification' in window && Notification.permission === 'granted'
    };
  }
}

// Global offline manager instance
const offlineManager = new OfflineManager();

// Add offline status indicator to all pages
document.addEventListener('DOMContentLoaded', () => {
  addOfflineStatusIndicator();
});

function addOfflineStatusIndicator() {
  const header = document.querySelector('.top-header .header-right');
  if (!header) return;

  const statusDiv = document.createElement('div');
  statusDiv.id = 'onlineStatus';
  statusDiv.className = offlineManager.isOnline ? 'online' : 'offline';
  statusDiv.textContent = offlineManager.isOnline ? 'Online' : 'Offline';
  statusDiv.style.cssText = `
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    margin-left: 10px;
  `;

  header.appendChild(statusDiv);
}

// Add offline styles
const offlineStyles = `
  #onlineStatus.online {
    background-color: #d4edda;
    color: #155724;
  }

  #onlineStatus.offline {
    background-color: #f8d7da;
    color: #721c24;
  }

  body.offline {
    filter: grayscale(20%);
  }

  body.offline .main-content {
    position: relative;
  }

  body.offline .main-content::before {
    content: 'You are currently offline. Some features may be limited.';
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff3cd;
    color: #856404;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = offlineStyles;
document.head.appendChild(styleSheet);

// Export for use in other scripts
window.offlineManager = offlineManager;
