// Dashboard JavaScript
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.classList.toggle("open")
}

function logout() {
  localStorage.removeItem("isLoggedIn")
  localStorage.removeItem("userEmail")
  localStorage.removeItem("userName")
  window.location.href = "index.html"
}

function showNotifications() {
  const panel = document.getElementById("notificationPanel")
  panel.classList.add("open")
}

function hideNotifications() {
  const panel = document.getElementById("notificationPanel")
  panel.classList.remove("open")
}

function markAsTaken(button, medId, time) {
  const scheduleItem = button.closest(".schedule-item")
  const statusSpan = scheduleItem.querySelector(".status")

  scheduleItem.classList.remove("pending", "upcoming")
  scheduleItem.classList.add("completed")
  statusSpan.textContent = "Taken"

  // Update button
  button.innerHTML = '<i class="fas fa-check"></i>'
  button.classList.add("completed")
  button.disabled = true

  // Record the medication taken event
  const takenRecord = {
    medicationId: medId,
    time: time,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString()
  }

  // Store in localStorage for history
  const history = JSON.parse(localStorage.getItem('medication_history') || '[]')
  history.push(takenRecord)
  localStorage.setItem('medication_history', JSON.stringify(history))

  // Show success message
  showToast("Medication marked as taken!", "success")

  console.log("Medication taken at:", new Date().toLocaleTimeString())
}

function snoozeReminder(button, medId, time) {
  const scheduleItem = button.closest(".schedule-item")
  const timeSpan = scheduleItem.querySelector(".time")

  // Add 15 minutes to current time
  const currentTime = new Date()
  currentTime.setMinutes(currentTime.getMinutes() + 15)
  const newTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  timeSpan.textContent = newTime

  showToast("Reminder snoozed for 15 minutes", "info")

  console.log("Reminder snoozed until:", newTime)
}

function addMedication() {
  // This would typically open a modal or navigate to add medication page
  window.location.href = "medications.html"
}

function showToast(message, type = "info") {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
    `

  // Add toast styles if not already added
  if (!document.querySelector("#toast-styles")) {
    const style = document.createElement("style")
    style.id = "toast-styles"
    style.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                animation: slideInRight 0.3s ease-out;
            }
            .toast-success { border-left: 4px solid var(--success); }
            .toast-error { border-left: 4px solid var(--danger-color); }
            .toast-info { border-left: 4px solid var(--info); }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `
    document.head.appendChild(style)
  }

  document.body.appendChild(toast)

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s ease-out reverse"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html"
    return
  }

  // Update user name in header if available
  const userName = localStorage.getItem("userName")
  if (userName) {
    const userNameElement = document.querySelector(".user-profile span")
    if (userNameElement) {
      userNameElement.textContent = userName
    }
  }

  // Load dashboard data
  loadDashboardData()

  // Set up notification system (mock)
  setupNotificationSystem()

  // Load medication warnings
  loadDashboardWarnings()
})

function loadDashboardData() {
  // Load medications count
  const medications = dataManager.getMedications() || []
  const activeMeds = medications.filter(med => med.active).length
  document.querySelector('.stat-card:nth-child(1) h3').textContent = activeMeds

  // Load pending reminders
  const pendingReminders = medications.filter(med => {
    // Simple logic: if medication is active and has times, consider it pending
    return med.active && med.times && med.times.length > 0
  }).length
  document.querySelector('.stat-card:nth-child(2) h3').textContent = pendingReminders

  // Load doses this week (mock calculation)
  const dosesThisWeek = medications.reduce((total, med) => {
    if (med.active && med.frequency) {
      const freq = med.frequency === 'once' ? 1 : med.frequency === 'twice' ? 2 : 3
      return total + (freq * 7) // Rough estimate
    }
    return total
  }, 0)
  document.querySelector('.stat-card:nth-child(3) h3').textContent = dosesThisWeek

  // Load appointments
  const appointments = dataManager.getAppointments() || []
  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled').length
  document.querySelector('.stat-card:nth-child(4) h3').textContent = upcomingAppointments

  // Load today's schedule
  loadTodaysSchedule()
}

function loadTodaysSchedule() {
  const medications = dataManager.getMedications() || []
  const scheduleContainer = document.querySelector('.medication-schedule')

  if (!scheduleContainer) return

  // Clear existing schedule
  scheduleContainer.innerHTML = ''

  // Get today's medications
  const today = new Date()
  const todayMeds = medications.filter(med => med.active && med.times)

  todayMeds.forEach(med => {
    med.times.forEach(time => {
      const scheduleItem = document.createElement('div')
      scheduleItem.className = 'schedule-item pending'

      const currentTime = today.getHours() * 100 + today.getMinutes()
      const medTime = parseInt(time.replace(':', ''))

      if (currentTime > medTime) {
        scheduleItem.classList.remove('pending')
        scheduleItem.classList.add('completed')
      }

      scheduleItem.innerHTML = `
        <div class="schedule-time">
          <span class="time">${time}</span>
          <span class="status">${currentTime > medTime ? 'Taken' : 'Pending'}</span>
        </div>
        <div class="schedule-medication">
          <h4>${med.name} ${med.dosage}</h4>
          <p>${med.instructions || 'Take as directed'}</p>
        </div>
        <div class="schedule-actions">
          <button class="btn-icon ${currentTime > medTime ? 'completed' : ''}" onclick="markAsTaken(this, ${med.id}, '${time}')" ${currentTime > medTime ? 'disabled' : ''}>
            <i class="fas fa-check"></i>
          </button>
          <button class="btn-icon" onclick="snoozeReminder(this, ${med.id}, '${time}')">
            <i class="fas fa-clock"></i>
          </button>
        </div>
      `

      scheduleContainer.appendChild(scheduleItem)
    })
  })
}

function setupNotificationSystem() {
  // Mock notification system - in real app, this would connect to push notifications
  setInterval(() => {
    // Check for pending medications (mock)
    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()

    // Example: Check if it's time for 2:00 PM medication (1400)
    if (currentTime === 1400) {
      showToast("Time to take your Lisinopril 10mg!", "info")

      // Update notification badge
      const badge = document.querySelector(".notification-badge")
      if (badge) {
        const count = Number.parseInt(badge.textContent) + 1
        badge.textContent = count
      }
    }
  }, 60000) // Check every minute
}

// Close notification panel when clicking outside
document.addEventListener("click", (event) => {
  const panel = document.getElementById("notificationPanel")
  const button = document.querySelector(".notification-btn")

  if (panel && panel.classList.contains("open") && !panel.contains(event.target) && !button.contains(event.target)) {
    hideNotifications()
  }
})

// Load and display medication warnings on dashboard
function loadDashboardWarnings() {
  const medications = dataManager.getMedications() || [];
  const warnings = interactionManager.getAllWarnings(medications);

  const container = document.getElementById('dashboardWarnings');
  if (!container) return;

  if (warnings.length === 0) {
    container.innerHTML = '<p class="no-warnings-preview">No medication alerts at this time.</p>';
    return;
  }

  // Show only top 3 warnings on dashboard
  const topWarnings = warnings.slice(0, 3);

  const warningsHtml = topWarnings.map(warning => {
    const formatted = interactionManager.formatWarning(warning);
    const severity = formatted.severityInfo;

    return `
      <div class="warning-preview-card ${warning.severity}">
        <div class="warning-preview-content">
          <h5>${formatted.title}</h5>
          <p>${warning.message}</p>
          <span class="warning-preview-severity ${warning.severity}">${warning.severity.toUpperCase()}</span>
        </div>
        <div class="warning-preview-actions">
          <button class="btn-link" onclick="dismissWarning('${warning.id}')">Dismiss</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = warningsHtml;
}
