// Hospitals JavaScript
function getCurrentLocation() {
  if (navigator.geolocation) {
    showToast("Getting your location...", "info")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // In a real app, you would use reverse geocoding to get the address
        document.getElementById("locationInput").value = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`

        showToast("Location found! Searching nearby facilities...", "success")
        searchLocation()
      },
      (error) => {
        console.error("Geolocation error:", error)
        showToast("Unable to get your location. Please enter manually.", "error")
      },
    )
  } else {
    showToast("Geolocation is not supported by this browser", "error")
  }
}

function searchLocation() {
  const location = document.getElementById("locationInput").value

  if (!location.trim()) {
    showToast("Please enter a location", "error")
    return
  }

  showToast("Searching for healthcare facilities...", "info")

  // In a real app, this would make an API call to search for facilities
  setTimeout(() => {
    showToast("Found nearby healthcare facilities!", "success")
    // The results would be dynamically populated here
  }, 1500)
}

function getDirections(facilityId) {
  console.log("Getting directions to:", facilityId)

  // In a real app, this would open the user's preferred maps app
  // For demo, we'll show a toast
  showToast("Opening directions in your maps app...", "info")

  // Simulate opening maps
  setTimeout(() => {
    // This would typically open Google Maps, Apple Maps, etc.
    // window.open(`https://maps.google.com/maps?daddr=${facilityAddress}`);
    showToast("Directions opened in maps app", "success")
  }, 1000)
}

function callFacility(phoneNumber) {
  console.log("Calling:", phoneNumber)

  // On mobile devices, this would initiate a phone call
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.location.href = `tel:${phoneNumber}`
  } else {
    // On desktop, show the phone number
    showToast(`Call ${phoneNumber}`, "info")
  }
}

function bookAppointment(facilityId) {
  console.log("Booking appointment at:", facilityId)

  // In a real app, this would open a booking modal or redirect to booking page
  showToast("Opening appointment booking...", "info")

  setTimeout(() => {
    showToast("Appointment booking system would open here", "info")
  }, 1000)
}

function checkIn(facilityId) {
  console.log("Checking in at:", facilityId)

  // In a real app, this would handle urgent care check-in
  showToast("Starting check-in process...", "info")

  setTimeout(() => {
    showToast("Check-in completed! You are #3 in line.", "success")
  }, 1500)
}

function transferPrescription(pharmacyId) {
  console.log("Transferring prescription to:", pharmacyId)

  // In a real app, this would open a prescription transfer form
  showToast("Opening prescription transfer form...", "info")

  setTimeout(() => {
    showToast("Prescription transfer form would open here", "info")
  }, 1000)
}

// Filter functionality
document.addEventListener("DOMContentLoaded", () => {
  const facilityTypeFilter = document.getElementById("facilityType")
  const specialtyFilter = document.getElementById("specialty")
  const distanceFilter = document.getElementById("distance")

  if (facilityTypeFilter) {
    facilityTypeFilter.addEventListener("change", filterFacilities)
  }

  if (specialtyFilter) {
    specialtyFilter.addEventListener("change", filterFacilities)
  }

  if (distanceFilter) {
    distanceFilter.addEventListener("change", filterFacilities)
  }

  // Initialize map placeholder click handler
  const mapPlaceholder = document.querySelector(".map-placeholder")
  if (mapPlaceholder) {
    mapPlaceholder.addEventListener("click", () => {
      showToast("Interactive map integration would be implemented here", "info")
    })
  }
})

function filterFacilities() {
  const facilityType = document.getElementById("facilityType").value
  const specialty = document.getElementById("specialty").value
  const distance = document.getElementById("distance").value

  const facilityCards = document.querySelectorAll(".facility-card")

  facilityCards.forEach((card) => {
    let showCard = true

    // Filter by facility type
    if (facilityType) {
      const cardType = card.querySelector(".facility-type").textContent.toLowerCase()
      if (!cardType.includes(facilityType.replace("-", " "))) {
        showCard = false
      }
    }

    // Filter by specialty
    if (specialty && showCard) {
      const specialties = Array.from(card.querySelectorAll(".specialty-tag")).map((tag) =>
        tag.textContent.toLowerCase(),
      )

      if (!specialties.some((s) => s.includes(specialty.replace("-", " ")))) {
        showCard = false
      }
    }

    // Filter by distance (in a real app, this would use actual distance calculations)
    if (distance && showCard) {
      const cardDistance = Number.parseFloat(card.querySelector(".facility-distance span").textContent)
      if (cardDistance > Number.parseFloat(distance)) {
        showCard = false
      }
    }

    // Show/hide card
    card.style.display = showCard ? "block" : "none"
  })

  // Show message if no results
  const visibleCards = Array.from(facilityCards).filter((card) => card.style.display !== "none")
  if (visibleCards.length === 0) {
    showToast("No facilities match your current filters", "info")
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
        `
    document.head.appendChild(style)
  }

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s ease-out reverse"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
