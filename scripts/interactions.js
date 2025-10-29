// Medication Interaction Warnings System
class InteractionManager {
  constructor() {
    this.interactions = this.loadInteractions();
    this.severityLevels = {
      'severe': { level: 3, color: '#dc3545', icon: 'fas fa-exclamation-triangle' },
      'moderate': { level: 2, color: '#fd7e14', icon: 'fas fa-exclamation-circle' },
      'minor': { level: 1, color: '#ffc107', icon: 'fas fa-info-circle' }
    };
  }

  // Load interaction database (in a real app, this would come from an API)
  loadInteractions() {
    return {
      // Severe interactions
      'warfarin-aspirin': {
        severity: 'severe',
        description: 'Increased risk of bleeding',
        advice: 'Consult your doctor immediately. May require dose adjustment.',
        category: 'bleeding'
      },
      'warfarin-ibuprofen': {
        severity: 'severe',
        description: 'Significantly increased bleeding risk',
        advice: 'Avoid combination. Use alternative pain relief.',
        category: 'bleeding'
      },
      'digoxin-calcium': {
        severity: 'severe',
        description: 'Calcium supplements reduce digoxin effectiveness',
        advice: 'Take digoxin 2 hours before or 4 hours after calcium.',
        category: 'absorption'
      },
      'lisinopril-potassium': {
        severity: 'severe',
        description: 'Risk of hyperkalemia (high potassium)',
        advice: 'Monitor potassium levels. Avoid potassium supplements.',
        category: 'electrolyte'
      },

      // Moderate interactions
      'metformin-digoxin': {
        severity: 'moderate',
        description: 'Metformin may increase digoxin levels',
        advice: 'Monitor digoxin levels and watch for side effects.',
        category: 'monitoring'
      },
      'atorvastatin-grapefruit': {
        severity: 'moderate',
        description: 'Grapefruit juice increases statin levels',
        advice: 'Limit grapefruit juice to 1 cup per day or avoid.',
        category: 'food'
      },
      'lisinopril-diuretics': {
        severity: 'moderate',
        description: 'Enhanced blood pressure lowering effect',
        advice: 'Monitor blood pressure closely. May need dose adjustment.',
        category: 'enhancement'
      },

      // Minor interactions
      'metformin-vitamin-b12': {
        severity: 'minor',
        description: 'Long-term metformin use may decrease vitamin B12',
        advice: 'Consider vitamin B12 monitoring or supplementation.',
        category: 'deficiency'
      },
      'warfarin-vitamin-k': {
        severity: 'minor',
        description: 'Vitamin K reduces warfarin effectiveness',
        advice: 'Maintain consistent vitamin K intake from diet.',
        category: 'effectiveness'
      }
    };
  }

  // Check for interactions between medications
  checkInteractions(medications) {
    const interactions = [];
    const medNames = medications.map(med => med.name.toLowerCase());

    // Check each pair of medications
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].name.toLowerCase();
        const med2 = medications[j].name.toLowerCase();

        // Check both combinations (med1-med2 and med2-med1)
        const key1 = `${med1}-${med2}`;
        const key2 = `${med2}-${med1}`;

        let interaction = this.interactions[key1] || this.interactions[key2];

        if (interaction) {
          interactions.push({
            medications: [medications[i], medications[j]],
            ...interaction
          });
        }
      }
    }

    return interactions;
  }

  // Check for interactions with a specific medication
  checkMedicationInteractions(medication, allMedications) {
    const interactions = [];
    const medName = medication.name.toLowerCase();

    allMedications.forEach(otherMed => {
      if (otherMed.id === medication.id) return;

      const otherName = otherMed.name.toLowerCase();
      const key1 = `${medName}-${otherName}`;
      const key2 = `${otherName}-${medName}`;

      let interaction = this.interactions[key1] || this.interactions[key2];

      if (interaction) {
        interactions.push({
          medications: [medication, otherMed],
          ...interaction
        });
      }
    });

    return interactions;
  }

  // Get interaction warnings for display
  getInteractionWarnings(medications) {
    const interactions = this.checkInteractions(medications);
    return interactions.map(interaction => ({
      id: `interaction-${Date.now()}-${Math.random()}`,
      type: 'interaction',
      severity: interaction.severity,
      title: `${interaction.medications[0].name} + ${interaction.medications[1].name}`,
      message: interaction.description,
      advice: interaction.advice,
      category: interaction.category,
      medications: interaction.medications,
      timestamp: new Date().toISOString()
    }));
  }

  // Check for duplicate therapies
  checkDuplicateTherapies(medications) {
    const warnings = [];
    const categories = {};

    medications.forEach(med => {
      const category = this.getMedicationCategory(med);
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(med);
    });

    Object.entries(categories).forEach(([category, meds]) => {
      if (meds.length > 1) {
        warnings.push({
          id: `duplicate-${category}-${Date.now()}`,
          type: 'duplicate',
          severity: 'moderate',
          title: `Multiple ${category} medications`,
          message: `You are taking ${meds.length} medications in the ${category} category`,
          advice: 'Consult your doctor to ensure this is appropriate.',
          category: 'duplicate',
          medications: meds,
          timestamp: new Date().toISOString()
        });
      }
    });

    return warnings;
  }

  // Categorize medication (simplified version)
  getMedicationCategory(medication) {
    const name = medication.name.toLowerCase();
    const condition = medication.condition ? medication.condition.toLowerCase() : '';

    if (name.includes('statin') || name.includes('atorvastatin') || name.includes('simvastatin')) {
      return 'cholesterol-lowering';
    }
    if (name.includes('ace') || name.includes('lisinopril') || name.includes('enalapril')) {
      return 'ace-inhibitor';
    }
    if (name.includes('beta') || name.includes('metoprolol') || name.includes('atenolol')) {
      return 'beta-blocker';
    }
    if (name.includes('diuretic') || name.includes('hydrochlorothiazide')) {
      return 'diuretic';
    }
    if (name.includes('antidiabetic') || name.includes('metformin') || name.includes('glipizide')) {
      return 'antidiabetic';
    }
    if (name.includes('anticoagulant') || name.includes('warfarin') || name.includes('heparin')) {
      return 'anticoagulant';
    }

    return 'other';
  }

  // Get all warnings for current medications
  getAllWarnings(medications) {
    const interactionWarnings = this.getInteractionWarnings(medications);
    const duplicateWarnings = this.checkDuplicateTherapies(medications);

    return [...interactionWarnings, ...duplicateWarnings].sort((a, b) => {
      // Sort by severity (severe first, then moderate, then minor)
      const severityOrder = { 'severe': 3, 'moderate': 2, 'minor': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  // Format warning for display
  formatWarning(warning) {
    const severity = this.severityLevels[warning.severity];
    return {
      ...warning,
      severityInfo: severity,
      formattedMedications: warning.medications.map(med => med.name).join(' + ')
    };
  }
}

// Global interaction manager instance
const interactionManager = new InteractionManager();

// UI functions for displaying warnings
function displayInteractionWarnings(warnings) {
  const container = document.getElementById('interactionWarnings');
  if (!container) return;

  if (warnings.length === 0) {
    container.innerHTML = '<p class="no-warnings">No interaction warnings found.</p>';
    return;
  }

  const warningsHtml = warnings.map(warning => {
    const formatted = interactionManager.formatWarning(warning);
    const severity = formatted.severityInfo;

    return `
      <div class="warning-card ${warning.severity}" data-warning-id="${warning.id}">
        <div class="warning-header">
          <div class="warning-icon">
            <i class="${severity.icon}" style="color: ${severity.color}"></i>
          </div>
          <div class="warning-title">
            <h5>${formatted.title}</h5>
            <span class="warning-severity ${warning.severity}">${warning.severity.toUpperCase()}</span>
          </div>
        </div>
        <div class="warning-content">
          <p class="warning-message">${warning.message}</p>
          <p class="warning-advice"><strong>Advice:</strong> ${warning.advice}</p>
          ${warning.category ? `<span class="warning-category">${warning.category}</span>` : ''}
        </div>
        <div class="warning-actions">
          <button class="btn-sm btn-outline-primary" onclick="dismissWarning('${warning.id}')">
            <i class="fas fa-times"></i> Dismiss
          </button>
          <button class="btn-sm btn-primary" onclick="consultDoctor('${warning.id}')">
            <i class="fas fa-user-md"></i> Consult Doctor
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = warningsHtml;
}

function dismissWarning(warningId) {
  // In a real app, this would be stored in user preferences
  const warningCard = document.querySelector(`[data-warning-id="${warningId}"]`);
  if (warningCard) {
    warningCard.style.display = 'none';
  }

  showToast('Warning dismissed', 'info');
}

function consultDoctor(warningId) {
  // This would integrate with doctor consultation or appointment booking
  showToast('Redirecting to doctor consultation...', 'info');

  // For now, just redirect to doctors page
  setTimeout(() => {
    window.location.href = 'doctors.html';
  }, 1000);
}

function showInteractionModal(medication) {
  const allMedications = dataManager.getMedications() || [];
  const interactions = interactionManager.checkMedicationInteractions(medication, allMedications);

  if (interactions.length === 0) {
    showToast('No interactions found for this medication', 'success');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'interactionModal';
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Interactions for ${medication.name}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          ${interactions.map(interaction => {
            const severity = interactionManager.severityLevels[interaction.severity];
            const otherMed = interaction.medications.find(med => med.id !== medication.id);

            return `
              <div class="interaction-item ${interaction.severity}">
                <div class="interaction-header">
                  <i class="${severity.icon}" style="color: ${severity.color}"></i>
                  <strong>${otherMed.name}</strong>
                  <span class="severity-badge ${interaction.severity}">${interaction.severity.toUpperCase()}</span>
                </div>
                <p class="interaction-description">${interaction.description}</p>
                <p class="interaction-advice"><strong>Advice:</strong> ${interaction.advice}</p>
              </div>
            `;
          }).join('')}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" onclick="consultDoctor()">Consult Doctor</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

// Initialize interaction warnings on page load
function initializeInteractionWarnings() {
  const medications = dataManager.getMedications() || [];
  const warnings = interactionManager.getAllWarnings(medications);

  // Display warnings on dashboard or medications page
  displayInteractionWarnings(warnings);

  // Add interaction check buttons to medication cards
  addInteractionCheckButtons();
}

function addInteractionCheckButtons() {
  const medicationCards = document.querySelectorAll('.medication-card');
  medicationCards.forEach(card => {
    const medicationId = card.dataset.medicationId;
    if (!medicationId) return;

    const medications = dataManager.getMedications() || [];
    const medication = medications.find(med => med.id === medicationId);
    if (!medication) return;

    const actionsDiv = card.querySelector('.medication-actions');
    if (!actionsDiv) return;

    const checkButton = document.createElement('button');
    checkButton.className = 'btn-icon';
    checkButton.title = 'Check Interactions';
    checkButton.onclick = () => showInteractionModal(medication);
    checkButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';

    actionsDiv.appendChild(checkButton);
  });
}

// Auto-initialize on relevant pages
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('medications.html') ||
      window.location.pathname.includes('dashboard.html')) {
    initializeInteractionWarnings();
  }
});
