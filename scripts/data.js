// Data Management System for MediCare App
class DataManager {
  constructor() {
    this.storageKeys = {
      medications: 'medicare_medications',
      appointments: 'medicare_appointments',
      vitals: 'medicare_vitals',
      emergencyContacts: 'medicare_emergency_contacts',
      userProfile: 'medicare_user_profile',
      settings: 'medicare_settings'
    };
    this.initializeData();
  }

  // Initialize default data if not exists
  initializeData() {
    // Initialize medications
    if (!this.getMedications()) {
      const defaultMedications = [
        {
          id: 1,
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice',
          times: ['08:00', '14:00'],
          instructions: 'Take with meals',
          condition: 'Type 2 Diabetes',
          stock: 28,
          prescribedBy: 'Dr. Johnson',
          type: 'prescription',
          active: true,
          startDate: '2024-01-01',
          endDate: null
        },
        {
          id: 2,
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'once',
          times: ['14:00'],
          instructions: 'Take after lunch',
          condition: 'High Blood Pressure',
          stock: 5,
          prescribedBy: 'Dr. Smith',
          type: 'prescription',
          active: true,
          startDate: '2024-01-01',
          endDate: null
        },
        {
          id: 3,
          name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'once',
          times: ['20:00'],
          instructions: 'Take with dinner',
          condition: 'Supplement',
          stock: 45,
          prescribedBy: 'Self',
          type: 'supplement',
          active: true,
          startDate: '2024-01-01',
          endDate: null
        }
      ];
      this.saveMedications(defaultMedications);
    }

    // Initialize appointments
    if (!this.getAppointments()) {
      const defaultAppointments = [
        {
          id: 1,
          doctorId: 1,
          doctorName: 'Dr. Emily Carter',
          specialty: 'Cardiologist',
          date: '2024-10-25',
          time: '10:00',
          location: 'City Heart Hospital',
          purpose: 'Regular checkup',
          status: 'scheduled',
          notes: 'Bring recent test results'
        }
      ];
      this.saveAppointments(defaultAppointments);
    }

    // Initialize vital signs
    if (!this.getVitals()) {
      const defaultVitals = [
        {
          id: 1,
          type: 'blood_pressure',
          systolic: 120,
          diastolic: 80,
          date: '2024-10-20',
          time: '08:00',
          notes: 'Morning reading'
        },
        {
          id: 2,
          type: 'glucose',
          value: 95,
          unit: 'mg/dL',
          date: '2024-10-20',
          time: '08:00',
          notes: 'Fasting glucose'
        }
      ];
      this.saveVitals(defaultVitals);
    }

    // Initialize emergency contacts
    if (!this.getEmergencyContacts()) {
      const defaultContacts = [
        {
          id: 1,
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+15559876543',
          email: 'jane.doe@email.com',
          isPrimary: true
        },
        {
          id: 2,
          name: 'Robert Doe',
          relationship: 'Father',
          phone: '+15554567890',
          email: 'robert.doe@email.com',
          isPrimary: false
        }
      ];
      this.saveEmergencyContacts(defaultContacts);
    }

    // Initialize user profile
    if (!this.getUserProfile()) {
      const defaultProfile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+15551234567',
        dateOfBirth: '1985-06-15',
        gender: 'male',
        address: '123 Main Street, Apt 4B\nNew York, NY 10001',
        height: "5'10\"",
        weight: '175 lbs',
        bloodType: 'A+',
        primaryDoctor: 'Dr. Sarah Johnson',
        conditions: 'Type 2 Diabetes\nHigh Blood Pressure\nSeasonal Allergies',
        allergies: 'Penicillin - Severe reaction\nShellfish - Mild reaction\nPollen - Seasonal symptoms',
        insurance: 'Blue Cross Blue Shield - Policy #12345678',
        emergencyContact: '+15559876543'
      };
      this.saveUserProfile(defaultProfile);
    }

    // Initialize settings
    if (!this.getSettings()) {
      const defaultSettings = {
        notifications: {
          medicationReminders: true,
          refillReminders: true,
          appointmentReminders: true,
          emailNotifications: false
        },
        privacy: {
          shareWithProviders: true,
          analytics: true
        },
        reminderSettings: {
          snoozeTime: 15,
          advanceNotice: 30
        }
      };
      this.saveSettings(defaultSettings);
    }
  }

  // Medications
  getMedications() {
    return JSON.parse(localStorage.getItem(this.storageKeys.medications)) || null;
  }

  saveMedications(medications) {
    localStorage.setItem(this.storageKeys.medications, JSON.stringify(medications));
  }

  addMedication(medication) {
    const medications = this.getMedications() || [];
    medication.id = Date.now(); // Simple ID generation
    medications.push(medication);
    this.saveMedications(medications);
    return medication.id;
  }

  updateMedication(id, updates) {
    const medications = this.getMedications() || [];
    const index = medications.findIndex(med => med.id === id);
    if (index !== -1) {
      medications[index] = { ...medications[index], ...updates };
      this.saveMedications(medications);
      return true;
    }
    return false;
  }

  deleteMedication(id) {
    const medications = this.getMedications() || [];
    const filtered = medications.filter(med => med.id !== id);
    this.saveMedications(filtered);
    return filtered.length < medications.length;
  }

  // Appointments
  getAppointments() {
    return JSON.parse(localStorage.getItem(this.storageKeys.appointments)) || null;
  }

  saveAppointments(appointments) {
    localStorage.setItem(this.storageKeys.appointments, JSON.stringify(appointments));
  }

  addAppointment(appointment) {
    const appointments = this.getAppointments() || [];
    appointment.id = Date.now();
    appointments.push(appointment);
    this.saveAppointments(appointments);
    return appointment.id;
  }

  updateAppointment(id, updates) {
    const appointments = this.getAppointments() || [];
    const index = appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      this.saveAppointments(appointments);
      return true;
    }
    return false;
  }

  deleteAppointment(id) {
    const appointments = this.getAppointments() || [];
    const filtered = appointments.filter(apt => apt.id !== id);
    this.saveAppointments(filtered);
    return filtered.length < appointments.length;
  }

  // Vital Signs
  getVitals() {
    return JSON.parse(localStorage.getItem(this.storageKeys.vitals)) || null;
  }

  saveVitals(vitals) {
    localStorage.setItem(this.storageKeys.vitals, JSON.stringify(vitals));
  }

  addVital(vital) {
    const vitals = this.getVitals() || [];
    vital.id = Date.now();
    vitals.push(vital);
    this.saveVitals(vitals);
    return vital.id;
  }

  getVitalsByType(type) {
    const vitals = this.getVitals() || [];
    return vitals.filter(vital => vital.type === type);
  }

  // Emergency Contacts
  getEmergencyContacts() {
    return JSON.parse(localStorage.getItem(this.storageKeys.emergencyContacts)) || null;
  }

  saveEmergencyContacts(contacts) {
    localStorage.setItem(this.storageKeys.emergencyContacts, JSON.stringify(contacts));
  }

  addEmergencyContact(contact) {
    const contacts = this.getEmergencyContacts() || [];
    contact.id = Date.now();
    contacts.push(contact);
    this.saveEmergencyContacts(contacts);
    return contact.id;
  }

  updateEmergencyContact(id, updates) {
    const contacts = this.getEmergencyContacts() || [];
    const index = contacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      this.saveEmergencyContacts(contacts);
      return true;
    }
    return false;
  }

  deleteEmergencyContact(id) {
    const contacts = this.getEmergencyContacts() || [];
    const filtered = contacts.filter(contact => contact.id !== id);
    this.saveEmergencyContacts(filtered);
    return filtered.length < contacts.length;
  }

  // User Profile
  getUserProfile() {
    return JSON.parse(localStorage.getItem(this.storageKeys.userProfile)) || null;
  }

  saveUserProfile(profile) {
    localStorage.setItem(this.storageKeys.userProfile, JSON.stringify(profile));
  }

  updateUserProfile(updates) {
    const profile = this.getUserProfile() || {};
    const updated = { ...profile, ...updates };
    this.saveUserProfile(updated);
    return updated;
  }

  // Settings
  getSettings() {
    return JSON.parse(localStorage.getItem(this.storageKeys.settings)) || null;
  }

  saveSettings(settings) {
    localStorage.setItem(this.storageKeys.settings, JSON.stringify(settings));
  }

  updateSettings(updates) {
    const settings = this.getSettings() || {};
    const updated = { ...settings, ...updates };
    this.saveSettings(updated);
    return updated;
  }

  // Utility functions
  exportData() {
    const data = {
      medications: this.getMedications(),
      appointments: this.getAppointments(),
      vitals: this.getVitals(),
      emergencyContacts: this.getEmergencyContacts(),
      userProfile: this.getUserProfile(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.medications) this.saveMedications(data.medications);
      if (data.appointments) this.saveAppointments(data.appointments);
      if (data.vitals) this.saveVitals(data.vitals);
      if (data.emergencyContacts) this.saveEmergencyContacts(data.emergencyContacts);
      if (data.userProfile) this.saveUserProfile(data.userProfile);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  clearAllData() {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Create global instance
const dataManager = new DataManager();
