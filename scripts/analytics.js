// Health Insights and Analytics System
class AnalyticsManager {
  constructor() {
    this.insights = {};
    this.charts = {};
    this.timeRanges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
  }

  // Calculate medication adherence rate
  calculateAdherenceRate(timeRange = '30d') {
    const history = dataManager.getMedicationHistory() || [];
    const medications = dataManager.getMedications() || [];
    const activeMeds = medications.filter(med => med.active);

    if (activeMeds.length === 0) return 0;

    const days = this.timeRanges[timeRange] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Calculate expected doses
    let expectedDoses = 0;
    activeMeds.forEach(med => {
      if (med.times && med.times.length > 0) {
        expectedDoses += med.times.length * days;
      }
    });

    // Count actual taken doses in time range
    const takenDoses = history.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= startDate;
    }).length;

    return expectedDoses > 0 ? Math.round((takenDoses / expectedDoses) * 100) : 0;
  }

  // Analyze vital signs trends
  analyzeVitalTrends(timeRange = '30d') {
    const vitals = dataManager.getVitalSigns() || [];
    const days = this.timeRanges[timeRange] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentVitals = vitals.filter(v => new Date(v.date) >= startDate);

    const trends = {
      bloodPressure: this.analyzeBloodPressure(recentVitals),
      heartRate: this.analyzeHeartRate(recentVitals),
      weight: this.analyzeWeight(recentVitals),
      temperature: this.analyzeTemperature(recentVitals)
    };

    return trends;
  }

  analyzeBloodPressure(vitals) {
    const bpReadings = vitals.filter(v => v.bloodPressure).map(v => ({
      systolic: parseInt(v.bloodPressure.split('/')[0]),
      diastolic: parseInt(v.bloodPressure.split('/')[1]),
      date: new Date(v.date)
    }));

    if (bpReadings.length < 2) return { trend: 'insufficient-data', average: null };

    const avgSystolic = bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length;
    const avgDiastolic = bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length;

    // Simple trend analysis (comparing first half vs second half)
    const midpoint = Math.floor(bpReadings.length / 2);
    const firstHalf = bpReadings.slice(0, midpoint);
    const secondHalf = bpReadings.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, r) => sum + r.systolic, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.systolic, 0) / secondHalf.length;

    let trend = 'stable';
    if (secondAvg > firstAvg + 5) trend = 'increasing';
    else if (secondAvg < firstAvg - 5) trend = 'decreasing';

    return {
      trend,
      average: `${Math.round(avgSystolic)}/${Math.round(avgDiastolic)}`,
      readings: bpReadings.length,
      status: this.getBPStatus(avgSystolic, avgDiastolic)
    };
  }

  analyzeHeartRate(vitals) {
    const hrReadings = vitals.filter(v => v.heartRate).map(v => ({
      rate: parseInt(v.heartRate),
      date: new Date(v.date)
    }));

    if (hrReadings.length < 2) return { trend: 'insufficient-data', average: null };

    const avgHR = hrReadings.reduce((sum, r) => sum + r.rate, 0) / hrReadings.length;

    const midpoint = Math.floor(hrReadings.length / 2);
    const firstHalf = hrReadings.slice(0, midpoint);
    const secondHalf = hrReadings.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, r) => sum + r.rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.rate, 0) / secondHalf.length;

    let trend = 'stable';
    if (secondAvg > firstAvg + 5) trend = 'increasing';
    else if (secondAvg < firstAvg - 5) trend = 'decreasing';

    return {
      trend,
      average: Math.round(avgHR),
      readings: hrReadings.length,
      status: this.getHRStatus(avgHR)
    };
  }

  analyzeWeight(vitals) {
    const weightReadings = vitals.filter(v => v.weight).map(v => ({
      weight: parseFloat(v.weight),
      date: new Date(v.date)
    }));

    if (weightReadings.length < 2) return { trend: 'insufficient-data', average: null };

    const avgWeight = weightReadings.reduce((sum, r) => sum + r.weight, 0) / weightReadings.length;
    const latest = weightReadings[weightReadings.length - 1].weight;
    const earliest = weightReadings[0].weight;
    const change = latest - earliest;

    let trend = 'stable';
    if (Math.abs(change) > 2) {
      trend = change > 0 ? 'increasing' : 'decreasing';
    }

    return {
      trend,
      average: avgWeight.toFixed(1),
      change: change.toFixed(1),
      readings: weightReadings.length,
      status: this.getWeightStatus(change)
    };
  }

  analyzeTemperature(vitals) {
    const tempReadings = vitals.filter(v => v.temperature).map(v => ({
      temp: parseFloat(v.temperature),
      date: new Date(v.date)
    }));

    if (tempReadings.length < 2) return { trend: 'insufficient-data', average: null };

    const avgTemp = tempReadings.reduce((sum, r) => sum + r.temp, 0) / tempReadings.length;

    return {
      trend: 'stable', // Temperature trends are less meaningful
      average: avgTemp.toFixed(1),
      readings: tempReadings.length,
      status: this.getTempStatus(avgTemp)
    };
  }

  // Health status evaluators
  getBPStatus(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return 'normal';
    if (systolic < 130 && diastolic < 80) return 'elevated';
    if (systolic < 140 || diastolic < 90) return 'high-stage1';
    return 'high-stage2';
  }

  getHRStatus(rate) {
    if (rate >= 60 && rate <= 100) return 'normal';
    if (rate < 60) return 'low';
    return 'high';
  }

  getWeightStatus(change) {
    if (Math.abs(change) <= 2) return 'stable';
    return Math.abs(change) > 5 ? 'significant-change' : 'moderate-change';
  }

  getTempStatus(temp) {
    if (temp >= 97 && temp <= 99) return 'normal';
    return 'abnormal';
  }

  // Generate health insights
  generateInsights() {
    const insights = [];

    // Medication adherence insight
    const adherence = this.calculateAdherenceRate('30d');
    if (adherence < 80) {
      insights.push({
        type: 'adherence',
        severity: 'warning',
        title: 'Low Medication Adherence',
        message: `Your medication adherence is ${adherence}% in the last 30 days.`,
        recommendation: 'Consider setting additional reminders or consulting your doctor.',
        icon: 'fas fa-exclamation-triangle'
      });
    }

    // Vital signs insights
    const trends = this.analyzeVitalTrends('30d');

    if (trends.bloodPressure.trend === 'increasing' && trends.bloodPressure.status !== 'normal') {
      insights.push({
        type: 'vitals',
        severity: 'warning',
        title: 'Blood Pressure Trending Up',
        message: `Your average blood pressure is ${trends.bloodPressure.average} (${trends.bloodPressure.status.replace('-', ' ')})`,
        recommendation: 'Monitor your blood pressure closely and consult your doctor if it continues to rise.',
        icon: 'fas fa-heartbeat'
      });
    }

    if (trends.heartRate.trend === 'increasing' && trends.heartRate.average > 100) {
      insights.push({
        type: 'vitals',
        severity: 'warning',
        title: 'Elevated Heart Rate',
        message: `Your average heart rate is ${trends.heartRate.average} bpm`,
        recommendation: 'Consider factors like stress, caffeine, or exercise. Consult your doctor if persistent.',
        icon: 'fas fa-heart'
      });
    }

    // Weight change insight
    if (Math.abs(parseFloat(trends.weight.change)) > 5) {
      const direction = parseFloat(trends.weight.change) > 0 ? 'gained' : 'lost';
      insights.push({
        type: 'weight',
        severity: 'info',
        title: `Significant Weight Change`,
        message: `You've ${direction} ${Math.abs(parseFloat(trends.weight.change))} lbs in the last 30 days.`,
        recommendation: 'Track your diet and exercise. Consult your doctor about significant weight changes.',
        icon: 'fas fa-weight'
      });
    }

    return insights;
  }

  // Generate health score (0-100)
  calculateHealthScore() {
    let score = 100;
    const penalties = [];

    // Medication adherence penalty
    const adherence = this.calculateAdherenceRate('30d');
    if (adherence < 90) {
      const penalty = Math.max(0, (90 - adherence) * 0.5);
      score -= penalty;
      penalties.push({ reason: 'Low medication adherence', points: -penalty });
    }

    // Vital signs penalties
    const trends = this.analyzeVitalTrends('30d');

    if (trends.bloodPressure.status !== 'normal') {
      const bpPenalty = trends.bloodPressure.status === 'high-stage2' ? 15 :
                       trends.bloodPressure.status === 'high-stage1' ? 10 :
                       trends.bloodPressure.status === 'elevated' ? 5 : 0;
      score -= bpPenalty;
      if (bpPenalty > 0) penalties.push({ reason: 'Abnormal blood pressure', points: -bpPenalty });
    }

    if (trends.heartRate.status !== 'normal') {
      score -= 10;
      penalties.push({ reason: 'Abnormal heart rate', points: -10 });
    }

    if (trends.weight.status === 'significant-change') {
      score -= 5;
      penalties.push({ reason: 'Significant weight change', points: -5 });
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, Math.round(score));

    return { score, penalties };
  }

  // Get health recommendations
  getRecommendations() {
    const recommendations = [];
    const adherence = this.calculateAdherenceRate('30d');
    const trends = this.analyzeVitalTrends('30d');

    if (adherence < 80) {
      recommendations.push({
        category: 'medication',
        priority: 'high',
        title: 'Improve Medication Adherence',
        description: 'Set daily reminders and track your medication intake consistently.',
        actions: ['Enable push notifications', 'Set multiple reminder times', 'Use pill organizer']
      });
    }

    if (trends.bloodPressure.status !== 'normal') {
      recommendations.push({
        category: 'lifestyle',
        priority: 'high',
        title: 'Blood Pressure Management',
        description: 'Focus on diet, exercise, and stress reduction to improve blood pressure.',
        actions: ['Reduce sodium intake', 'Exercise regularly', 'Practice stress management', 'Monitor daily']
      });
    }

    if (trends.heartRate.average > 100) {
      recommendations.push({
        category: 'lifestyle',
        priority: 'medium',
        title: 'Heart Rate Optimization',
        description: 'Maintain healthy heart rate through lifestyle choices.',
        actions: ['Reduce caffeine', 'Practice relaxation techniques', 'Regular exercise', 'Adequate sleep']
      });
    }

    recommendations.push({
      category: 'monitoring',
      priority: 'medium',
      title: 'Regular Health Monitoring',
      description: 'Keep track of your vital signs and medication adherence.',
      actions: ['Log vitals weekly', 'Review medication schedule', 'Schedule regular check-ups']
    });

    return recommendations;
  }
}

// Global analytics manager instance
const analyticsManager = new AnalyticsManager();

// UI functions for displaying analytics
function displayHealthInsights(insights) {
  const container = document.getElementById('healthInsights');
  if (!container) return;

  if (insights.length === 0) {
    container.innerHTML = '<p class="no-insights">No health insights available at this time.</p>';
    return;
  }

  const insightsHtml = insights.map(insight => `
    <div class="insight-card ${insight.severity}">
      <div class="insight-header">
        <i class="${insight.icon}"></i>
        <h5>${insight.title}</h5>
      </div>
      <div class="insight-content">
        <p>${insight.message}</p>
        <p class="recommendation"><strong>Recommendation:</strong> ${insight.recommendation}</p>
      </div>
    </div>
  `).join('');

  container.innerHTML = insightsHtml;
}

function displayHealthScore(scoreData) {
  const container = document.getElementById('healthScore');
  if (!container) return;

  const { score, penalties } = scoreData;
  const scoreClass = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

  container.innerHTML = `
    <div class="score-display ${scoreClass}">
      <div class="score-circle">
        <span class="score-number">${score}</span>
        <span class="score-label">Health Score</span>
      </div>
      <div class="score-details">
        <p class="score-description">${getScoreDescription(score)}</p>
        ${penalties.length > 0 ? `
          <div class="score-penalties">
            <h6>Score Factors:</h6>
            <ul>
              ${penalties.map(p => `<li>${p.reason} <span class="penalty-points">${p.points}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getScoreDescription(score) {
  if (score >= 90) return 'Excellent! Keep up the great work.';
  if (score >= 80) return 'Very good health management.';
  if (score >= 70) return 'Good overall health status.';
  if (score >= 60) return 'Fair health status. Some improvements needed.';
  if (score >= 50) return 'Health status needs attention.';
  return 'Health status requires immediate attention.';
}

function displayHealthTrends(trends) {
  const container = document.getElementById('healthTrends');
  if (!container) return;

  const trendsHtml = `
    <div class="trends-grid">
      <div class="trend-card">
        <h6>Blood Pressure</h6>
        <div class="trend-value">${trends.bloodPressure.average || 'No data'}</div>
        <div class="trend-status ${trends.bloodPressure.status || 'unknown'}">${trends.bloodPressure.status || 'Unknown'}</div>
        <div class="trend-indicator ${trends.bloodPressure.trend}">${trends.bloodPressure.trend || 'No trend'}</div>
      </div>

      <div class="trend-card">
        <h6>Heart Rate</h6>
        <div class="trend-value">${trends.heartRate.average || 'No data'} bpm</div>
        <div class="trend-status ${trends.heartRate.status || 'unknown'}">${trends.heartRate.status || 'Unknown'}</div>
        <div class="trend-indicator ${trends.heartRate.trend}">${trends.heartRate.trend || 'No trend'}</div>
      </div>

      <div class="trend-card">
        <h6>Weight</h6>
        <div class="trend-value">${trends.weight.average || 'No data'} lbs</div>
        <div class="trend-change">${trends.weight.change ? `${trends.weight.change > 0 ? '+' : ''}${trends.weight.change} lbs` : ''}</div>
        <div class="trend-indicator ${trends.weight.trend}">${trends.weight.trend || 'No trend'}</div>
      </div>

      <div class="trend-card">
        <h6>Temperature</h6>
        <div class="trend-value">${trends.temperature.average || 'No data'}°F</div>
        <div class="trend-status ${trends.temperature.status || 'unknown'}">${trends.temperature.status || 'Unknown'}</div>
      </div>
    </div>
  `;

  container.innerHTML = trendsHtml;
}

function displayRecommendations(recommendations) {
  const container = document.getElementById('healthRecommendations');
  if (!container) return;

  const recommendationsHtml = recommendations.map(rec => `
    <div class="recommendation-card ${rec.priority}">
      <div class="recommendation-header">
        <span class="priority-badge ${rec.priority}">${rec.priority.toUpperCase()}</span>
        <h5>${rec.title}</h5>
      </div>
      <p>${rec.description}</p>
      <ul class="recommendation-actions">
        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  container.innerHTML = recommendationsHtml;
}

// Initialize analytics on relevant pages
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('analytics.html') ||
      window.location.pathname.includes('dashboard.html')) {
    loadAnalyticsData();
  }
});

function loadAnalyticsData() {
  const insights = analyticsManager.generateInsights();
  const healthScore = analyticsManager.calculateHealthScore();
  const trends = analyticsManager.analyzeVitalTrends('30d');
  const recommendations = analyticsManager.getRecommendations();

  displayHealthInsights(insights);
  displayHealthScore(healthScore);
  displayHealthTrends(trends);
  displayRecommendations(recommendations);
}
