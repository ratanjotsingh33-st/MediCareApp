// Medications JavaScript
function showAddMedicationModal() {
  const modal = document.getElementById("addMedicationModal")
  modal.classList.add("open")
}

function hideAddMedicationModal() {
  const modal = document.getElementById("addMedicationModal")
  modal.classList.remove("open")
}

function editMedication(id) {
  console.log("Edit medication:", id)
  // Here you would populate the modal with existing medication data
  showAddMedicationModal()
}

function orderRefill(id) {
  console.log("Order refill for medication:", id)
  showToast("Refill order placed successfully!", "success")

  // Here you would typically make an API call to order refill
  // For demo, we'll simulate the order process
  setTimeout(() => {
    showToast("Your refill will be ready for pickup in 2-3 business days", "info")
  }, 2000)
}

function pauseMedication(id) {
  if (confirm("Are you sure you want to pause this medication? You will stop receiving reminders.")) {
    console.log("Pause medication:", id)

    // Find the medication card and update its status
    const cards = document.querySelectorAll(".medication-card")
    cards.forEach((card) => {
      // In a real app, you'd match by data-id attribute
      if (card.querySelector('.medication-actions .btn-icon[onclick*="' + id + '"]')) {
        const statusBadge = card.querySelector(".status-badge")
        statusBadge.textContent = "Paused"
        statusBadge.className = "status-badge paused"
        card.className = "medication-card paused"
      }
    })

    showToast("Medication paused successfully", "info")
  }
}

function deleteMedication(id) {
  if (confirm("Are you sure you want to delete this medication? This action cannot be undone.")) {
    console.log("Delete medication:", id)

    // Find and remove the medication card
    const cards = document.querySelectorAll(".medication-card")
    cards.forEach((card) => {
      if (card.querySelector('.medication-actions .btn-icon[onclick*="' + id + '"]')) {
        card.style.animation = "fadeOut 0.3s ease-out"
        setTimeout(() => card.remove(), 300)
      }
    })

    showToast("Medication deleted successfully", "success")
  }
}

// Search and filter functionality
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("medicationSearch")
  const categoryFilter = document.getElementById("categoryFilter")
  const statusFilter = document.getElementById("statusFilter")

  if (searchInput) {
    searchInput.addEventListener("input", filterMedications)
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterMedications)
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", filterMedications)
  }

  // Handle form submission
  const medicationForm = document.querySelector(".medication-form")
  if (medicationForm) {
    medicationForm.addEventListener("submit", handleAddMedication)
  }
})

function filterMedications() {
  const searchTerm = document.getElementById("medicationSearch").value.toLowerCase()
  const categoryFilter = document.getElementById("categoryFilter").value
  const statusFilter = document.getElementById("statusFilter").value

  const cards = document.querySelectorAll(".medication-card")

  cards.forEach((card) => {
    const medicationName = card.querySelector("h3").textContent.toLowerCase()
    const medicationCondition = card.querySelector(".condition").textContent.toLowerCase()
    const medicationStatus = card.classList.contains("active")
      ? "active"
      : card.classList.contains("paused")
        ? "paused"
        : "completed"

    // Determine category (this would typically come from data attributes)
    let medicationCategory = "prescription" // default
    if (medicationName.includes("vitamin")) {
      medicationCategory = "supplement"
    }

    const matchesSearch = medicationName.includes(searchTerm) || medicationCondition.includes(searchTerm)
    const matchesCategory = !categoryFilter || medicationCategory === categoryFilter
    const matchesStatus = !statusFilter || medicationStatus === statusFilter

    if (matchesSearch && matchesCategory && matchesStatus) {
      card.style.display = "block"
    } else {
      card.style.display = "none"
    }
  })
}

function handleAddMedication(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const medicationData = {
    name: document.getElementById("medicationName").value,
    dosage: document.getElementById("dosage").value,
    frequency: document.getElementById("frequency").value,
    type: document.getElementById("medicationType").value,
    condition: document.getElementById("condition").value,
    instructions: document.getElementById("instructions").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    stockQuantity: document.getElementById("stockQuantity").value,
    prescribedBy: document.getElementById("prescribedBy").value,
  }

  // Basic validation
  if (!medicationData.name || !medicationData.dosage || !medicationData.frequency || !medicationData.type) {
    alert("Please fill in all required fields")
    return
  }

  console.log("Adding medication:", medicationData)

  // Here you would typically make an API call to save the medication
  // For demo purposes, we'll just show a success message
  showToast("Medication added successfully!", "success")
  hideAddMedicationModal()

  // Reset form
  event.target.reset()

  // In a real app, you would refresh the medications list here
}

// Close modal when clicking outside
document.addEventListener("click", (event) => {
  const modal = document.getElementById("addMedicationModal")
  if (modal && modal.classList.contains("open") && event.target === modal) {
    hideAddMedicationModal()
  }
})

// Toast function (same as dashboard)
function showToast(message, type = "info") {
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
        <span>${message}</span>
    `

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
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.95); }
            }
        `
    document.head.appendChild(style)
  }

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s ease-out reverse"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
