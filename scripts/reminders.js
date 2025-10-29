// Reminders Page JavaScript with Push Notifications and Customization
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }

  loadReminders();
  setupAddReminderModal();
  setupNotificationPermissions();
  initializeNotifications();
  setupReminderActions();
});

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("open");
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "index.html";
}

// Load reminders from medications and display them
function loadReminders() {
  const medications = dataManager.getMedications() || [];
  const container = document.querySelector('.main-content');
  const header = container.querySelector('.d-flex.justify-content-between');

  // Clear existing reminder cards
  const existingCards = container.querySelectorAll('.reminder-card');
  existingCards.forEach(card => card.remove());

  // Generate reminders from medications
  const reminders = generateRemindersFromMedications(medications);

  // Sort reminders by time
  reminders.sort((a, b) => {
    const timeA = new Date(`2000-01-01 ${a.time}`);
    const timeB = new Date(`2000-01-01 ${b.time}`);
    return timeA - timeB;
  });

  // Add reminder cards
  reminders.forEach(reminder => {
    const card = createReminderCard(reminder);
    container.appendChild(card);
  });

  // Update notification badges
  updateNotificationBadges();
}

function generateRemindersFromMedications(medications) {
  const reminders = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  medications.forEach(med => {
    if (med.schedule && med.schedule.length > 0) {
      med.schedule.forEach(time => {
        const reminderTime = new Date(`${today} ${time}`);
        const status = getReminderStatus(reminderTime, med.id, time);

        reminders.push({
          id: `${med.id}_${time}`,
          medicationId: med.id,
          name: med.name,
          dosage: med.dosage,
          time: time,
          instructions: med.instructions || 'Take as prescribed',
          status: status,
          reminderTime: reminderTime,
          soundEnabled: med.soundEnabled !== false,
          vibrationEnabled: med.vibrationEnabled !== false,
          customMessage: med.customMessage || null
        });
      });
    }
  });

  return reminders;
}

function getReminderStatus(reminderTime, medId, time) {
  const history = dataManager.getMedicationHistory() || [];
  const today = new Date().toISOString().split('T')[0];

  // Check if taken today at this time
  const takenEntry = history.find(entry =>
    entry.medicationId === medId &&
    entry.time === time &&
    entry.date === today
  );

  if (takenEntry) {
    return 'taken';
  }

  const now = new Date();
  if (reminderTime < now) {
    return 'missed';
  }

  // Check if within 30 minutes of reminder time
  const timeDiff = (reminderTime - now) / (1000 * 60);
  if (timeDiff <= 30 && timeDiff > 0) {
    return 'pending';
  }

  return 'upcoming';
}

function createReminderCard(reminder) {
  const card = document.createElement('div');
  card.className = `reminder-card ${reminder.status}`;
  card.dataset.reminderId = reminder.id;

  const statusText = reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1);
  const statusClass = reminder.status === 'taken' ? 'done' :
                     reminder.status === 'missed' ? 'missed' :
                     reminder.status === 'pending' ? 'pending' : 'upcoming';

  card.innerHTML = `
    <div class="reminder-info">
      <h5>${reminder.name} ${reminder.dosage}</h5>
      <p>${reminder.instructions}</p>
      <small>${reminder.time}</small>
      ${reminder.customMessage ? `<div class="custom-message">${reminder.customMessage}</div>` : ''}
    </div>
    <div class="reminder-actions">
      <span class="status ${statusClass}">${statusText}</span>
      ${reminder.status === 'pending' || reminder.status === 'upcoming' ?
        `<button class="btn btn-sm btn-success take-btn" onclick="markAsTaken('${reminder.id}')">
          <i class="fas fa-check"></i> Take
        </button>` : ''}
      ${reminder.status === 'pending' ?
        `<button class="btn btn-sm btn-warning snooze-btn" onclick="snoozeReminder('${reminder.id}')">
          <i class="fas fa-clock"></i> Snooze
        </button>` : ''}
      <button class="btn btn-sm btn-outline-primary customize-btn" onclick="customizeReminder('${reminder.id}')">
        <i class="fas fa-cog"></i>
      </button>
    </div>
  `;

  return card;
}

function markAsTaken(reminderId) {
  const [medId, time] = reminderId.split('_');
  const now = new Date();

  const takenRecord = {
    medicationId: medId,
    time: time,
    date: now.toISOString().split('T')[0],
    timestamp: now.toISOString()
  };

  // Store in medication history
  const history = JSON.parse(localStorage.getItem('medication_history') || '[]');
  history.push(takenRecord);
  localStorage.setItem('medication_history', JSON.stringify(history));

  // Update UI
  loadReminders();

  // Show success message
  showToast('Medication marked as taken!', 'success');

  // Cancel any pending notifications for this reminder
  cancelReminderNotification(reminderId);
}

function snoozeReminder(reminderId) {
  // Add 15 minutes to current time
  const snoozeTime = new Date();
  snoozeTime.setMinutes(snoozeTime.getMinutes() + 15);

  // Schedule snooze notification
  scheduleNotification(reminderId, snoozeTime, 'Snoozed reminder');

  showToast('Reminder snoozed for 15 minutes', 'info');
}

function customizeReminder(reminderId) {
  const [medId, time] = reminderId.split('_');
  const medications = dataManager.getMedications() || [];
  const med = medications.find(m => m.id === medId);

  if (!med) return;

  showCustomizationModal(med, time);
}

function showCustomizationModal(medication, time) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'customizeModal';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Customize Reminder</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <h6>${medication.name} ${medication.dosage} - ${time}</h6>
          </div>
          <div class="mb-3">
            <label class="form-label">Custom Message (Optional)</label>
            <input type="text" class="form-control" id="customMessage" placeholder="e.g., Take with food" value="${medication.customMessage || ''}">
          </div>
          <div class="mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="soundEnabled" ${medication.soundEnabled !== false ? 'checked' : ''}>
              <label class="form-check-label" for="soundEnabled">
                Enable sound notification
              </label>
            </div>
          </div>
          <div class="mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="vibrationEnabled" ${medication.vibrationEnabled !== false ? 'checked' : ''}>
              <label class="form-check-label" for="vibrationEnabled">
                Enable vibration (mobile only)
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="saveCustomization('${medication.id}')">Save Changes</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function saveCustomization(medId) {
  const medications = dataManager.getMedications() || [];
  const medIndex = medications.findIndex(m => m.id === medId);

  if (medIndex === -1) return;

  medications[medIndex].customMessage = document.getElementById('customMessage').value;
  medications[medIndex].soundEnabled = document.getElementById('soundEnabled').checked;
  medications[medIndex].vibrationEnabled = document.getElementById('vibrationEnabled').checked;

  dataManager.saveMedications(medications);

  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('customizeModal'));
  modal.hide();

  // Refresh reminders
  loadReminders();

  showToast('Reminder customized successfully!', 'success');
}

function setupAddReminderModal() {
  const addBtn = document.querySelector('.btn-add');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    showAddReminderModal();
  });
}

function showAddReminderModal() {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'addReminderModal';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add Custom Reminder</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form id="addReminderForm">
            <div class="mb-3">
              <label for="reminderTitle" class="form-label">Reminder Title</label>
              <input type="text" class="form-control" id="reminderTitle" required placeholder="e.g., Take vitamins">
            </div>
            <div class="mb-3">
              <label for="reminderTime" class="form-label">Time</label>
              <input type="time" class="form-control" id="reminderTime" required>
            </div>
            <div class="mb-3">
              <label for="reminderMessage" class="form-label">Message (Optional)</label>
              <textarea class="form-control" id="reminderMessage" rows="2" placeholder="Additional instructions..."></textarea>
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="reminderSound" checked>
                <label class="form-check-label" for="reminderSound">
                  Enable sound notification
                </label>
              </div>
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="reminderVibration" checked>
                <label class="form-check-label" for="reminderVibration">
                  Enable vibration (mobile only)
                </label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="addCustomReminder()">Add Reminder</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function addCustomReminder() {
  const form = document.getElementById('addReminderForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const customReminders = JSON.parse(localStorage.getItem('custom_reminders') || '[]');

  const newReminder = {
    id: Date.now().toString(),
    title: document.getElementById('reminderTitle').value,
    time: document.getElementById('reminderTime').value,
    message: document.getElementById('reminderMessage').value,
    soundEnabled: document.getElementById('reminderSound').checked,
    vibrationEnabled: document.getElementById('reminderVibration').checked,
    created: new Date().toISOString()
  };

  customReminders.push(newReminder);
  localStorage.setItem('custom_reminders', JSON.stringify(customReminders));

  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('addReminderModal'));
  modal.hide();

  // Refresh reminders
  loadReminders();

  showToast('Custom reminder added successfully!', 'success');
}

function setupNotificationPermissions() {
  // Request notification permission on page load
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }
}

function initializeNotifications() {
  // Schedule notifications for upcoming reminders
  const medications = dataManager.getMedications() || [];
  const reminders = generateRemindersFromMedications(medications);

  reminders.forEach(reminder => {
    if (reminder.status === 'upcoming' || reminder.status === 'pending') {
      scheduleNotification(reminder.id, reminder.reminderTime, reminder.name, reminder);
    }
  });
}

function scheduleNotification(reminderId, time, title, reminder = null) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const now = new Date();
  const delay = time - now;

  if (delay > 0) {
    setTimeout(() => {
      showNotification(title, reminder);
    }, delay);
  }
}

function showNotification(title, reminder = null) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const options = {
    body: reminder ? `${reminder.dosage} - ${reminder.instructions}` : 'Time for your medication',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'medication-reminder',
    requireInteraction: true,
    actions: [
      { action: 'take', title: 'Mark as Taken' },
      { action: 'snooze', title: 'Snooze 15min' }
    ]
  };

  const notification = new Notification(title, options);

  // Handle notification actions
  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto-close after 10 seconds
  setTimeout(() => {
    notification.close();
  }, 10000);
}

function cancelReminderNotification(reminderId) {
  // In a real implementation, you'd cancel the scheduled timeout
  // For now, we'll just update the UI
  console.log('Cancelled notification for:', reminderId);
}

function updateNotificationBadges() {
  const pendingCount = document.querySelectorAll('.reminder-card.pending').length;
  const upcomingCount = document.querySelectorAll('.reminder-card.upcoming').length;

  // Update page title with notification count
  if (pendingCount > 0) {
    document.title = `(${pendingCount}) Reminders - MediCare`;
  } else {
    document.title = 'Reminders - MediCare';
  }
}

function setupReminderActions() {
  // Additional setup if needed
}

function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  // Add toast styles if not already added
  if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideInRight 0.3s ease-out;
      }
      .toast-success { border-left: 4px solid #198754; }
      .toast-error { border-left: 4px solid #dc3545; }
      .toast-info { border-left: 4px solid #0dcaf0; }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
