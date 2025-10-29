// Profile JavaScript
function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Show selected tab content
  document.getElementById(tabName + "Tab").classList.add("active")

  // Add active class to clicked button
  event.target.classList.add("active")
}

function editProfile() {
  const form = document.querySelector("#personalTab .profile-form")
  const inputs = form.querySelectorAll("input, select, textarea")
  const button = event.target

  if (button.textContent.includes("Edit")) {
    // Enable editing
    inputs.forEach((input) => {
      input.removeAttribute("readonly")
      input.removeAttribute("disabled")
      input.style.background = "var(--surface)"
      input.style.cursor = "text"
    })

    button.innerHTML = '<i class="fas fa-save"></i> Save Changes'
    button.classList.remove("btn-secondary")
    button.classList.add("btn-primary")

    // Add cancel button
    const cancelBtn = document.createElement("button")
    cancelBtn.className = "btn-secondary"
    cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel'
    cancelBtn.onclick = cancelEdit
    button.parentNode.insertBefore(cancelBtn, button.nextSibling)
  } else {
    // Save changes
    saveProfileChanges()
  }
}

function cancelEdit() {
  const form = document.querySelector("#personalTab .profile-form")
  const inputs = form.querySelectorAll("input, select, textarea")
  const editButton = document.querySelector(".profile-actions .btn-primary")
  const cancelButton = event.target

  // Disable editing
  inputs.forEach((input) => {
    input.setAttribute("readonly", "")
    if (input.tagName === "SELECT") {
      input.setAttribute("disabled", "")
    }
    input.style.background = "var(--surface-secondary)"
    input.style.cursor = "not-allowed"
  })

  // Reset button
  editButton.innerHTML = '<i class="fas fa-edit"></i> Edit Profile'
  editButton.classList.remove("btn-primary")
  editButton.classList.add("btn-secondary")

  // Remove cancel button
  cancelButton.remove()

  // Reset form values (in real app, you'd restore from original data)
  showToast("Changes cancelled", "info")
}

function saveProfileChanges() {
  const form = document.querySelector("#personalTab .profile-form")
  const formData = new FormData(form)

  // Here you would typically make an API call to save the changes
  console.log("Saving profile changes...")

  // Simulate API call
  setTimeout(() => {
    const inputs = form.querySelectorAll("input, select, textarea")
    const editButton = document.querySelector(".profile-actions .btn-primary")
    const cancelButton = document.querySelector(".profile-actions .btn-secondary")

    // Disable editing
    inputs.forEach((input) => {
      input.setAttribute("readonly", "")
      if (input.tagName === "SELECT") {
        input.setAttribute("disabled", "")
      }
      input.style.background = "var(--surface-secondary)"
      input.style.cursor = "not-allowed"
    })

    // Reset button
    editButton.innerHTML = '<i class="fas fa-edit"></i> Edit Profile'
    editButton.classList.remove("btn-primary")
    editButton.classList.add("btn-secondary")

    // Remove cancel button
    if (cancelButton) {
      cancelButton.remove()
    }

    showToast("Profile updated successfully!", "success")
  }, 1000)
}

function changeAvatar() {
  // Create file input
  const fileInput = document.createElement("input")
  fileInput.type = "file"
  fileInput.accept = "image/*"
  fileInput.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Update avatar images
        document.querySelectorAll(".profile-avatar, .profile-avatar-large").forEach((img) => {
          img.src = e.target.result
        })
        showToast("Profile picture updated!", "success")
      }
      reader.readAsDataURL(file)
    }
  }
  fileInput.click()
}

function addEmergencyContact() {
  // In a real app, this would open a modal to add a new contact
  const contactsContainer = document.querySelector(".emergency-contacts")
  const newContact = document.createElement("div")
  newContact.className = "contact-card"
  newContact.innerHTML = `
        <div class="contact-info">
            <h4>New Contact</h4>
            <p class="relationship">Relationship</p>
            <p class="contact-details">
                <i class="fas fa-phone"></i>
                +1 (555) 000-0000
            </p>
            <p class="contact-details">
                <i class="fas fa-envelope"></i>
                contact@email.com
            </p>
        </div>
        <div class="contact-actions">
            <button class="btn-icon" onclick="editContact('new')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon danger" onclick="deleteContact('new')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `
  contactsContainer.appendChild(newContact)
  showToast("New emergency contact added. Click edit to update details.", "info")
}

function editContact(id) {
  console.log("Edit contact:", id)
  showToast("Contact editing would open a modal in a real app", "info")
}

function deleteContact(id) {
  if (confirm("Are you sure you want to delete this emergency contact?")) {
    const contactCard = event.target.closest(".contact-card")
    contactCard.style.animation = "fadeOut 0.3s ease-out"
    setTimeout(() => contactCard.remove(), 300)
    showToast("Emergency contact deleted", "success")
  }
}

function changePassword() {
  // In a real app, this would open a modal for password change
  showToast("Password change modal would open in a real app", "info")
}

function exportData() {
  // Simulate data export
  showToast("Preparing your data export...", "info")
  setTimeout(() => {
    showToast("Data export ready! Check your downloads folder.", "success")
  }, 2000)
}

function deleteAccount() {
  if (
    confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.",
    )
  ) {
    if (confirm("This is your final warning. Are you absolutely sure you want to delete your account?")) {
      showToast("Account deletion initiated. You will receive a confirmation email.", "info")
      // In a real app, this would start the account deletion process
    }
  }
}

// Toast function
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

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html"
    return
  }

  // Set default tab
  showTab("personal")
})
