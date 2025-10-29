// Analytics UI and Chart Management
let charts = {};

function updateAnalytics() {
  const timeRange = document.getElementById('timeRange').value;
  loadAnalyticsData(timeRange);
}

function loadAnalyticsData(timeRange = '30d') {
  const insights = analyticsManager.generateInsights();
  const healthScore = analyticsManager.calculateHealthScore();
  const trends = analyticsManager.analyzeVitalTrends(timeRange);
  const recommendations = analyticsManager.getRecommendations();

  displayHealthInsights(insights);
  displayHealthScore(healthScore);
  displayHealthTrends(trends);
  displayRecommendations(recommendations);

  // Update charts with new time range
  updateCharts(timeRange);
}

function updateCharts(timeRange = '30d') {
  const vitals = dataManager.getVitalSigns() || [];
  const history = dataManager.getMedicationHistory() || [];

  const days = analyticsManager.timeRanges[timeRange] || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Filter data for time range
  const filteredVitals = vitals.filter(v => new Date(v.date) >= startDate);
  const filteredHistory = history.filter(h => new Date(h.timestamp) >= startDate);

  // Create/update charts
  createAdherenceChart(filteredHistory, timeRange);
  createBloodPressureChart(filteredVitals);
  createHeartRateChart(filteredVitals);
  createWeightChart(filteredVitals);
}

function createAdherenceChart(history, timeRange) {
  const ctx = document.getElementById('adherenceChart');
  if (!ctx) return;

  // Destroy existing chart
  if (charts.adherence) {
    charts.adherence.destroy();
  }

  // Calculate adherence by day
  const days = analyticsManager.timeRanges[timeRange] || 30;
  const adherenceData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayHistory = history.filter(h => h.timestamp.startsWith(dateStr));
    const medications = dataManager.getMedications() || [];
    const activeMeds = medications.filter(med => med.active);

    let expectedDoses = 0;
    activeMeds.forEach(med => {
      if (med.times && med.times.length > 0) {
        expectedDoses += med.times.length;
      }
    });

    const actualDoses = dayHistory.length;
    const adherence = expectedDoses > 0 ? (actualDoses / expectedDoses) * 100 : 100;

    adherenceData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      adherence: Math.min(adherence, 100)
    });
  }

  charts.adherence = new Chart(ctx, {
    type: 'line',
    data: {
      labels: adherenceData.map(d => d.date),
      datasets: [{
        label: 'Adherence %',
        data: adherenceData.map(d => d.adherence),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

function createBloodPressureChart(vitals) {
  const ctx = document.getElementById('bloodPressureChart');
  if (!ctx) return;

  if (charts.bloodPressure) {
    charts.bloodPressure.destroy();
  }

  const bpData = vitals.filter(v => v.bloodPressure).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    systolic: parseInt(v.bloodPressure.split('/')[0]),
    diastolic: parseInt(v.bloodPressure.split('/')[1])
  }));

  charts.bloodPressure = new Chart(ctx, {
    type: 'line',
    data: {
      labels: bpData.map(d => d.date),
      datasets: [{
        label: 'Systolic',
        data: bpData.map(d => d.systolic),
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4
      }, {
        label: 'Diastolic',
        data: bpData.map(d => d.diastolic),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          suggestedMin: 60,
          suggestedMax: 180
        }
      }
    }
  });
}

function createHeartRateChart(vitals) {
  const ctx = document.getElementById('heartRateChart');
  if (!ctx) return;

  if (charts.heartRate) {
    charts.heartRate.destroy();
  }

  const hrData = vitals.filter(v => v.heartRate).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rate: parseInt(v.heartRate)
  }));

  charts.heartRate = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hrData.map(d => d.date),
      datasets: [{
        label: 'Heart Rate (bpm)',
        data: hrData.map(d => d.rate),
        borderColor: '#FFCE56',
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          suggestedMin: 40,
          suggestedMax: 120
        }
      }
    }
  });
}

function createWeightChart(vitals) {
  const ctx = document.getElementById('weightChart');
  if (!ctx) return;

  if (charts.weight) {
    charts.weight.destroy();
  }

  const weightData = vitals.filter(v => v.weight).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat(v.weight)
  }));

  charts.weight = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weightData.map(d => d.date),
      datasets: [{
        label: 'Weight (lbs)',
        data: weightData.map(d => d.weight),
        borderColor: '#9966FF',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('analytics.html')) {
    // Load initial data
    loadAnalyticsData();

    // Set up time range change handler
    const timeRangeSelect = document.getElementById('timeRange');
    if (timeRangeSelect) {
      timeRangeSelect.addEventListener('change', () => {
        updateAnalytics();
      });
    }
  }
});
