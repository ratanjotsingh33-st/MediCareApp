// Doctors Page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
    return;
  }

  loadDoctors();
  setupSearch();
  setupAppointmentBooking();
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

// Load doctors from data manager
function loadDoctors() {
  // For now, using static data. In a real app, this would come from an API
  const doctors = [
    {
      id: 1,
      name: "Dr. Emily Carter",
      specialty: "Cardiologist",
      hospital: "City Heart Hospital",
      email: "emily.carter@cityheart.com",
      phone: "+1 555-0199",
      rating: 4.8,
      experience: "15 years",
      nextAvailable: "2024-10-25",
      image: "https://via.placeholder.com/70"
    },
    {
      id: 2,
      name: "Dr. Rajesh Sharma",
      specialty: "Endocrinologist",
      hospital: "Metro Health Clinic",
      email: "drrajesh@metrohealth.com",
      phone: "+91 98765 43210",
      rating: 4.9,
      experience: "12 years",
      nextAvailable: "2024-10-26",
      image: "https://via.placeholder.com/70"
    },
    {
      id: 3,
      name: "Dr. Sarah Williams",
      specialty: "General Physician",
      hospital: "Downtown Medical Center",
      email: "sarahw@dmc.com",
      phone: "+1 555-0201",
      rating: 4.7,
      experience: "10 years",
      nextAvailable: "2024-10-24",
      image: "https://via.placeholder.com/70"
    }
  ];

  renderDoctors(doctors);
}

function renderDoctors(doctors) {
  const container = document.querySelector('.main-content');
  const searchBar = container.querySelector('.d-flex.justify-content-between');

  // Clear existing doctor cards
  const existingCards = container.querySelectorAll('.doctor-card');
  existingCards.forEach(card => card.remove());

  // Add doctor cards
  doctors.forEach(doctor => {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <div class="doctor-info">
        <img src="${doctor.image}" alt="Doctor" class="doctor-img">
        <div class="doctor-details">
          <h5>${doctor.name}</h5>
          <p>${doctor.specialty} - ${doctor.hospital}</p>
          <div class="doctor-meta">
            <small>⭐ ${doctor.rating} • ${doctor.experience} experience</small><br>
            <small>Email: ${doctor.email} | Phone: ${doctor.phone}</small><br>
            <small class="text-success">Next available: ${formatDate(doctor.nextAvailable)}</small>
          </div>
        </div>
      </div>
      <div class="doctor-actions">
        <button class="btn-book" onclick="bookAppointment(${doctor.id})">Book Appointment</button>
        <button class="btn-view" onclick="viewDoctorProfile(${doctor.id})">View Profile</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function setupSearch() {
  const searchInput = document.querySelector('.search-bar input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    filterDoctors(query);
  });
}

function filterDoctors(query) {
  const doctorCards = document.querySelectorAll('.doctor-card');

  doctorCards.forEach(card => {
    const name = card.querySelector('h5').textContent.toLowerCase();
    const specialty = card.querySelector('p').textContent.toLowerCase();
    const hospital = card.querySelector('p').textContent.toLowerCase();

    const matches = name.includes(query) ||
                   specialty.includes(query) ||
                   hospital.includes(query);

    card.style.display = matches ? 'flex' : 'none';
  });
}

function bookAppointment(doctorId) {
  // Get doctor details (in real app, this would come from data)
  const doctors = [
    { id: 1, name: "Dr. Emily Carter", specialty: "Cardiologist", hospital: "City Heart Hospital" },
    { id: 2, name: "Dr. Rajesh Sharma", specialty: "Endocrinologist", hospital: "Metro Health Clinic" },
    { id: 3, name: "Dr. Sarah Williams", specialty: "General Physician", hospital: "Downtown Medical Center" }
  ];

  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) return;

  showAppointmentModal(doctor);
}

function showAppointmentModal(doctor) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('appointmentModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'appointmentModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Book Appointment</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="doctor-summary mb-3 p-3 bg-light rounded">
              <h6>${doctor.name}</h6>
              <p class="mb-1">${doctor.specialty}</p>
              <p class="mb-0 text-muted">${doctor.hospital}</p>
            </div>
            <form id="appointmentForm">
              <div class="mb-3">
                <label for="appointmentDate" class="form-label">Preferred Date</label>
                <input type="date" class="form-control" id="appointmentDate" required>
              </div>
              <div class="mb-3">
                <label for="appointmentTime" class="form-label">Preferred Time</label>
                <select class="form-select" id="appointmentTime" required>
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="appointmentType" class="form-label">Appointment Type</label>
                <select class="form-select" id="appointmentType" required>
                  <option value="">Select type</option>
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="check-up">Regular Check-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="appointmentNotes" class="form-label">Notes (Optional)</label>
                <textarea class="form-control" id="appointmentNotes" rows="3" placeholder="Any specific concerns or symptoms..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitAppointment(${doctor.id})">Book Appointment</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('appointmentDate').min = today;

  // Show modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function submitAppointment(doctorId) {
  const form = document.getElementById('appointmentForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const appointmentData = {
    doctorId: doctorId,
    date: document.getElementById('appointmentDate').value,
    time: document.getElementById('appointmentTime').value,
    type: document.getElementById('appointmentType').value,
    notes: document.getElementById('appointmentNotes').value,
    status: 'scheduled'
  };

  // Get doctor details
  const doctors = [
    { id: 1, name: "Dr. Emily Carter", specialty: "Cardiologist", hospital: "City Heart Hospital" },
    { id: 2, name: "Dr. Rajesh Sharma", specialty: "Endocrinologist", hospital: "Metro Health Clinic" },
    { id: 3, name: "Dr. Sarah Williams", specialty: "General Physician", hospital: "Downtown Medical Center" }
  ];

  const doctor = doctors.find(d => d.id === doctorId);
  if (doctor) {
    appointmentData.doctorName = doctor.name;
    appointmentData.specialty = doctor.specialty;
    appointmentData.location = doctor.hospital;
    appointmentData.purpose = appointmentData.type;
  }

  // Save appointment
  const appointmentId = dataManager.addAppointment(appointmentData);

  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
  modal.hide();

  // Show success message
  showToast(`Appointment booked successfully with ${doctor.name}!`, 'success');

  // Reset form
  form.reset();
}

function viewDoctorProfile(doctorId) {
  // In a real app, this would navigate to a detailed doctor profile page
  showToast('Doctor profile feature coming soon!', 'info');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
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

function setupAppointmentBooking() {
  // Additional setup if needed
}
