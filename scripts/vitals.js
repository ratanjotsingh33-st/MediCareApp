// Vital Signs JavaScript
let vitalsChart = null;

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }

  loadVitalsOverview();
  loadVitalsHistory();
  initializeChart();
  setupVitalForm();
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

function loadVitalsOverview() {
  const vitals = dataManager.getVitals() || [];
  const vitalsGrid = document.getElementById('vitalsGrid');

  if (!vitalsGrid) return;

  // Group vitals by type and get latest reading
  const latestVitals = {};
  vitals.forEach(vital => {
    if (!latestVitals[vital.type] || new Date(vital.date + ' ' + vital.time) > new Date(latestVitals[vital.type].date + ' ' + latestVitals[vital.type].time)) {
      latestVitals[vital.type] = vital;
    }
  });

  const vitalTypes = [
    { key: 'blood_pressure', name: 'Blood Pressure', icon: 'fas fa-heartbeat', unit: 'mmHg', normalRange: { systolic: [90, 120], diastolic: [60, 80] } },
    { key: 'glucose', name: 'Blood Glucose', icon: 'fas fa-tint', unit: 'mg/dL', normalRange: [70, 140] },
    { key: 'weight', name: 'Weight', icon: 'fas fa-weight', unit: 'lbs', normalRange: [100, 200] }, // Generic range
    { key: 'temperature', name: 'Temperature', icon: 'fas fa-thermometer-half', unit: '°F', normalRange: [97, 99] },
    { key: 'heart_rate', name: 'Heart Rate', icon: 'fas fa-heart', unit: 'bpm', normalRange: [60, 100] }
  ];

  vitalsGrid.innerHTML = '';

  vitalTypes.forEach(type => {
    const latest = latestVitals[type.key];
    const card = document.createElement('div');
    card.className = 'vital-card';

    let value = 'No data';
    let status = 'no-data';
    let trend = '';

    if (latest) {
      if (type.key === 'blood_pressure') {
        value = `${latest.systolic}/${latest.diastolic}`;
        const systolicNormal = type.normalRange.systolic[0] <= latest.systolic && latest.systolic <= type.normalRange.systolic[1];
        const diastolicNormal = type.normalRange.diastolic[0] <= latest.diastolic && latest.diastolic <= type.normalRange.diastolic[1];
        status = systolicNormal && diastolicNormal ? 'normal' : 'high';
      } else {
        value = latest.value || latest.systolic;
        const inRange = Array.isArray(type.normalRange)
          ? type.normalRange[0] <= latest.value && latest.value <= type.normalRange[1]
          : true; // For weight, we'll consider it normal for now
        status = inRange ? 'normal' : (latest.value > type.normalRange[1] ? 'high' : 'low');
      }

      // Calculate trend (simple: compare with previous reading)
      const typeVitals = vitals.filter(v => v.type === type.key).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
      if (typeVitals.length > 1) {
        const current = typeVitals[0];
        const previous = typeVitals[1];
        let currentVal, prevVal;

        if (type.key === 'blood_pressure') {
          currentVal = (current.systolic + current.diastolic) / 2;
          prevVal = (previous.systolic + previous.diastolic) / 2;
        } else {
          currentVal = current.value;
          prevVal = previous.value;
        }

        if (currentVal > prevVal) {
          trend = '<i class="fas fa-arrow-up"></i> Increased';
        } else if (currentVal < prevVal) {
          trend = '<i class="fas fa-arrow-down"></i> Decreased';
        } else {
          trend = '<i class="fas fa-minus"></i> Stable';
        }
      }
    }

    card.innerHTML = `
      <div class="vital-header">
        <div class="vital-icon ${type.key.replace('_', '-')}">
          <i class="${type.icon}"></i>
        </div>
        <div>
          <h3>${type.name}</h3>
          <div class="vital-value ${status === 'normal' ? 'reading-normal' : status === 'high' ? 'reading-high' : 'reading-low'}">
            ${value}
            ${latest ? `<span class="vital-unit">${type.unit}</span>` : ''}
          </div>
          ${trend ? `<div class="vital-trend ${trend.includes('Increased') ? 'trend-up' : trend.includes('Decreased') ? 'trend-down' : 'trend-stable'}">${trend}</div>` : ''}
        </div>
      </div>
    `;

    vitalsGrid.appendChild(card);
  });
}

function loadVitalsHistory(filter = 'all') {
  const vitals = dataManager.getVitals() || [];
  const historyBody = document.getElementById('historyTableBody');

  if (!historyBody) return;

  let filteredVitals = vitals;
  if (filter !== 'all') {
    filteredVitals = vitals.filter(v => v.type === filter);
  }

  // Sort by date/time descending
  filteredVitals.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

  historyBody.innerHTML = '';

  filteredVitals.slice(0, 20).forEach(vital => {
    const row = document.createElement('tr');

    let reading = '';
    let status = 'normal';

    if (vital.type === 'blood_pressure') {
      reading = `${vital.systolic}/${vital.diastolic} mmHg`;
      const systolicNormal = 90 <= vital.systolic && vital.systolic <= 120;
      const diastolicNormal = 60 <= vital.diastolic && vital.diastolic <= 80;
      status = systolicNormal && diastolicNormal ? 'normal' : 'high';
    } else {
      const units = {
        glucose: 'mg/dL',
        weight: 'lbs',
        temperature: '°F',
        heart_rate: 'bpm'
      };
      reading = `${vital.value} ${units[vital.type] || ''}`;

      // Simple status determination
      const ranges = {
        glucose: [70, 140],
        weight: [100, 200],
        temperature: [97, 99],
        heart_rate: [60, 100]
      };

      if (ranges[vital.type]) {
        const [min, max] = ranges[vital.type];
        status = vital.value >= min && vital.value <= max ? 'normal' : (vital.value > max ? 'high' : 'low');
      }
    }

    const typeNames = {
      blood_pressure: 'Blood Pressure',
      glucose: 'Blood Glucose',
      weight: 'Weight',
      temperature: 'Temperature',
      heart_rate: 'Heart Rate'
    };

    row.innerHTML = `
      <td>${new Date(vital.date + ' ' + vital.time).toLocaleString()}</td>
      <td>${typeNames[vital.type] || vital.type}</td>
      <td class="vital-reading ${status === 'normal' ? 'reading-normal' : status === 'high' ? 'reading-high' : 'reading-low'}">${reading}</td>
      <td><span class="status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
      <td>${vital.notes || '-'}</td>
    `;

    historyBody.appendChild(row);
  });
}

function initializeChart() {
  const ctx = document.getElementById('vitalsChart');
  if (!ctx) return;

  vitalsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Blood Pressure (Systolic)',
        data: [],
        borderColor: '#c62828',
        backgroundColor: 'rgba(198, 40, 40, 0.1)',
        tension: 0.4
      }, {
        label: 'Blood Pressure (Diastolic)',
        data: [],
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });

  updateChart();
}

function updateChart() {
  if (!vitalsChart) return;

  const chartType = document.getElementById('chartType').value;
  const period = parseInt(document.getElementById('chartPeriod').value);

  const vitals = dataManager.getVitals() || [];
  const typeVitals = vitals.filter(v => v.type === chartType);

  // Sort by date
  typeVitals.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Filter by period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - period);
  const filteredVitals = typeVitals.filter(v => new Date(v.date) >= cutoffDate);

  const labels = filteredVitals.map(v => new Date(v.date).toLocaleDateString());

  if (chartType === 'blood_pressure') {
    vitalsChart.data.datasets = [{
      label: 'Systolic',
      data: filteredVitals.map(v => v.systolic),
      borderColor: '#c62828',
      backgroundColor: 'rgba(198, 40, 40, 0.1)',
      tension: 0.4
    }, {
      label: 'Diastolic',
      data: filteredVitals.map(v => v.diastolic),
      borderColor: '#2e7d32',
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      tension: 0.4
    }];
  } else {
    vitalsChart.data.datasets = [{
      label: chartType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      data: filteredVitals.map(v => v.value),
      borderColor: '#1565c0',
      backgroundColor: 'rgba(21, 101, 192, 0.1)',
      tension: 0.4
    }];
  }

  vitalsChart.data.labels = labels;
  vitalsChart.update();
}

function showAddVitalModal() {
  const modal = document.getElementById('addVitalModal');
  modal.classList.add('show');

  // Set default date and time
  const now = new Date();
  document.getElementById('vitalDate').value = now.toISOString().split('T')[0];
  document.getElementById('vitalTime').value = now.toTimeString().slice(0, 5);
}

function hideAddVitalModal() {
  const modal = document.getElementById('addVitalModal');
  modal.classList.remove('show');
  document.getElementById('addVitalForm').reset();
}

function setupVitalForm() {
  const vitalTypeSelect = document.getElementById('vitalType');
  const vitalInputs = document.getElementById('vitalInputs');
  const form = document.getElementById('addVitalForm');

  vitalTypeSelect.addEventListener('change', () => {
    const type = vitalTypeSelect.value;
    vitalInputs.innerHTML = '';

    if (type === 'blood_pressure') {
      vitalInputs.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="systolic">Systolic</label>
            <input type="number" class="form-input" id="systolic" placeholder="120" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="diastolic">Diastolic</label>
            <input type="number" class="form-input" id="diastolic" placeholder="80" required>
          </div>
        </div>
      `;
    } else {
      const placeholders = {
        glucose: '100',
        weight: '150',
        temperature: '98.6',
        heart_rate: '72'
      };

      const labels = {
        glucose: 'Blood Glucose Level',
        weight: 'Weight',
        temperature: 'Temperature',
        heart_rate: 'Heart Rate'
      };

      vitalInputs.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="vitalValue">${labels[type] || 'Value'}</label>
          <input type="number" step="0.1" class="form-input" id="vitalValue" placeholder="${placeholders[type] || '0'}" required>
        </div>
      `;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveVitalReading();
  });
}

function saveVitalReading() {
  const type = document.getElementById('vitalType').value;
  const date = document.getElementById('vitalDate').value;
  const time = document.getElementById('vitalTime').value;
  const notes = document.getElementById('vitalNotes').value;

  let vitalData = {
    type,
    date,
    time,
    notes
  };

  if (type === 'blood_pressure') {
    vitalData.systolic = parseInt(document.getElementById('systolic').value);
    vitalData.diastolic = parseInt(document.getElementById('diastolic').value);
  } else {
    vitalData.value = parseFloat(document.getElementById('vitalValue').value);
  }

  dataManager.addVital(vitalData);

  showToast('Vital sign reading saved successfully!', 'success');
  hideAddVitalModal();
  loadVitalsOverview();
  loadVitalsHistory();
  updateChart();
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
      .toast-success { border-left: 4px solid #2e7d32; }
      .toast-error { border-left: 4px solid #c62828; }
      .toast-info { border-left: 4px solid #1565c0; }
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
