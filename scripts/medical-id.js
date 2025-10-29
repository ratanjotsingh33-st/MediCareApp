// Medical ID Management
class MedicalIDManager {
  constructor() {
    this.medicalID = this.loadMedicalID();
    this.init();
  }

  init() {
    this.loadMedicalIDData();
    this.setupFormHandlers();
    this.updateMedicalIDCard();
  }

  loadMedicalID() {
    const saved = localStorage.getItem('medicalID');
    return saved ? JSON.parse(saved) : this.getDefaultMedicalID();
  }

  getDefaultMedicalID() {
    return {
      fullName: '',
      dateOfBirth: '',
      bloodType: '',
      height: '',
      weight: '',
      organDonor: 'no',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelation: '',
      conditions: '',
      allergies: '',
      medications: '',
      additionalInfo: '',
      lastUpdated: new Date().toISOString()
    };
  }

  saveMedicalID() {
    this.medicalID.lastUpdated = new Date().toISOString();
    localStorage.setItem('medicalID', JSON.stringify(this.medicalID));
  }

  loadMedicalIDData() {
    // Populate form with saved data
    Object.keys(this.medicalID).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        element.value = this.medicalID[key];
      }
    });

    // Auto-populate medications from current medications
    if (!this.medicalID.medications) {
      const medications = dataManager.getMedications() || [];
      const activeMeds = medications.filter(med => med.active);
      const medsList = activeMeds.map(med => `${med.name} ${med.dosage}`).join(', ');
      document.getElementById('medications').value = medsList;
    }
  }

  setupFormHandlers() {
    const form = document.getElementById('medicalIDForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveFormData();
      });
    }
  }

  saveFormData() {
    const formData = new FormData(document.getElementById('medicalIDForm'));

    // Update medical ID object
    for (let [key, value] of formData.entries()) {
      this.medicalID[key] = value;
    }

    this.saveMedicalID();
    this.updateMedicalIDCard();

    showToast('Medical ID updated successfully!', 'success');
  }

  updateMedicalIDCard() {
    // Update the visual ID card
    const id = this.medicalID;

    document.getElementById('idName').textContent = id.fullName || 'Name not set';
    document.getElementById('idDob').textContent = id.dateOfBirth ?
      `Date of Birth: ${new Date(id.dateOfBirth).toLocaleDateString()}` : 'Date of Birth: Not set';
    document.getElementById('idBloodType').textContent = id.bloodType ?
      `Blood Type: ${id.bloodType}` : 'Blood Type: Not set';

    document.getElementById('emergencyName').textContent = id.emergencyName || 'Not set';
    document.getElementById('emergencyPhone').textContent = id.emergencyPhone || 'Not set';
    document.getElementById('emergencyRelation').textContent = id.emergencyRelation || 'Not set';

    document.getElementById('conditions').textContent = id.conditions || 'None listed';
    document.getElementById('allergies').textContent = id.allergies || 'None listed';
    document.getElementById('currentMeds').textContent = id.medications || 'None listed';
    document.getElementById('organDonor').textContent = id.organDonor === 'yes' ? 'Yes' : 'No';
  }

  resetMedicalID() {
    if (confirm('Are you sure you want to reset your Medical ID? This will clear all information.')) {
      this.medicalID = this.getDefaultMedicalID();
      this.saveMedicalID();
      this.loadMedicalIDData();
      this.updateMedicalIDCard();
      showToast('Medical ID reset successfully', 'info');
    }
  }

  shareMedicalID() {
    const medicalInfo = this.formatMedicalInfo();

    if (navigator.share) {
      navigator.share({
        title: 'Medical ID - Emergency Information',
        text: medicalInfo
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(medicalInfo).then(() => {
        showToast('Medical ID copied to clipboard', 'success');
      }).catch(() => {
        // Fallback: show in alert
        alert('Medical Information:\n\n' + medicalInfo);
      });
    }
  }

  formatMedicalInfo() {
    const id = this.medicalID;
    return `EMERGENCY MEDICAL ID

Name: ${id.fullName}
DOB: ${id.dateOfBirth ? new Date(id.dateOfBirth).toLocaleDateString() : 'Not set'}
Blood Type: ${id.bloodType || 'Not set'}

EMERGENCY CONTACT:
${id.emergencyName} (${id.emergencyRelation})
Phone: ${id.emergencyPhone}

MEDICAL CONDITIONS:
${id.conditions || 'None listed'}

ALLERGIES:
${id.allergies || 'None listed'}

CURRENT MEDICATIONS:
${id.medications || 'None listed'}

ADDITIONAL INFO:
${id.additionalInfo || 'None'}

Organ Donor: ${id.organDonor === 'yes' ? 'Yes' : 'No'}`;
  }

  printMedicalID() {
    const printWindow = window.open('', '_blank');
    const medicalInfo = this.formatMedicalInfo();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical ID - ${this.medicalID.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #d9534f; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .emergency { background: #f8d7da; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEDICAL ID</h1>
            <h2>${this.medicalID.fullName}</h2>
          </div>

          <div class="emergency">
            <h3>🚨 EMERGENCY CONTACT</h3>
            <p><strong>${this.medicalID.emergencyName}</strong> (${this.medicalID.emergencyRelation})</p>
            <p>Phone: ${this.medicalID.emergencyPhone}</p>
          </div>

          <div class="section">
            <h3>Basic Information</h3>
            <p><strong>DOB:</strong> ${this.medicalID.dateOfBirth ? new Date(this.medicalID.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
            <p><strong>Blood Type:</strong> ${this.medicalID.bloodType || 'Not set'}</p>
            <p><strong>Organ Donor:</strong> ${this.medicalID.organDonor === 'yes' ? 'Yes' : 'No'}</p>
          </div>

          <div class="section">
            <h3>Medical Conditions</h3>
            <p>${this.medicalID.conditions || 'None listed'}</p>
          </div>

          <div class="section">
            <h3>Allergies</h3>
            <p>${this.medicalID.allergies || 'None listed'}</p>
          </div>

          <div class="section">
            <h3>Current Medications</h3>
            <p>${this.medicalID.medications || 'None listed'}</p>
          </div>

          <div class="section">
            <h3>Additional Information</h3>
            <p>${this.medicalID.additionalInfo || 'None'}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }

  downloadMedicalID() {
    const medicalInfo = this.formatMedicalInfo();
    const blob = new Blob([medicalInfo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Medical-ID-${this.medicalID.fullName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Medical ID downloaded', 'success');
  }

  generateQRCode() {
    // This would integrate with a QR code library
    // For now, we'll show a placeholder
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) {
      qrContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="width: 200px; height: 200px; background: #f8f9fa; border: 1px solid #dee2e6; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
            <div style="font-size: 14px; color: #6c757d;">
              QR Code would be generated here<br>
              <small>Contains encrypted medical info</small>
            </div>
          </div>
          <p style="margin-top: 10px; font-size: 12px; color: #6c757d;">
            Scan to access emergency medical information
          </p>
        </div>
      `;
    }
  }

  emergencyMode() {
    const modal = document.getElementById('emergencyModal');
    if (modal) {
      modal.style.display = 'flex';

      // Update emergency info
      document.getElementById('emergencyContactInfo').textContent =
        `${this.medicalID.emergencyName} - ${this.medicalID.emergencyPhone}`;

      // Try to get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          document.getElementById('currentLocation').textContent =
            `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
        }, () => {
          document.getElementById('currentLocation').textContent = 'Location access denied';
        });
      }
    }
  }

  callEmergency() {
    if (confirm('Call emergency services?')) {
      window.location.href = 'tel:911';
    }
  }

  call911() {
    window.location.href = 'tel:911';
  }

  sendEmergencyAlert() {
    // This would integrate with SMS or emergency alert system
    showToast('Emergency alert sent to contacts', 'success');
  }

  getEmergencyData() {
    return {
      name: this.medicalID.fullName,
      bloodType: this.medicalID.bloodType,
      allergies: this.medicalID.allergies,
      conditions: this.medicalID.conditions,
      medications: this.medicalID.medications,
      emergencyContact: {
        name: this.medicalID.emergencyName,
        phone: this.medicalID.emergencyPhone,
        relation: this.medicalID.emergencyRelation
      },
      organDonor: this.medicalID.organDonor === 'yes'
    };
  }
}

// Global functions for UI
function shareMedicalID() {
  medicalIDManager.shareMedicalID();
}

function printMedicalID() {
  medicalIDManager.printMedicalID();
}

function downloadMedicalID() {
  medicalIDManager.downloadMedicalID();
}

function scanQRCode() {
  medicalIDManager.generateQRCode();
  showToast('QR Code feature coming soon', 'info');
}

function emergencyMode() {
  medicalIDManager.emergencyMode();
}

function callEmergency() {
  medicalIDManager.callEmergency();
}

function resetMedicalID() {
  medicalIDManager.resetMedicalID();
}

function closeEmergencyModal() {
  document.getElementById('emergencyModal').style.display = 'none';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.medicalIDManager = new MedicalIDManager();
});
