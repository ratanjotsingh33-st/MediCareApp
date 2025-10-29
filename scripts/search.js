// Search and Filter Utilities for MediCare App
class SearchManager {
  constructor() {
    this.debounceTimer = null;
  }

  // Debounce function to limit search calls
  debounce(func, wait) {
    return (...args) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Generic search function
  searchItems(items, searchTerm, searchFields) {
    if (!searchTerm || searchTerm.trim() === '') {
      return items;
    }

    const term = searchTerm.toLowerCase().trim();
    return items.filter(item => {
      return searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        return value && value.toLowerCase().includes(term);
      });
    });
  }

  // Generic filter function
  filterItems(items, filters) {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === '' || value === null || value === undefined) return true;

        const itemValue = this.getNestedValue(item, key);
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        return itemValue === value;
      });
    });
  }

  // Get nested object value by path
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Sort items
  sortItems(items, sortBy, sortOrder = 'asc') {
    return [...items].sort((a, b) => {
      const aVal = this.getNestedValue(a, sortBy);
      const bVal = this.getNestedValue(b, sortBy);

      let result = 0;
      if (aVal < bVal) result = -1;
      if (aVal > bVal) result = 1;

      return sortOrder === 'desc' ? -result : result;
    });
  }

  // Combined search, filter, and sort
  processItems(items, options = {}) {
    const { searchTerm, searchFields, filters, sortBy, sortOrder } = options;

    let result = [...items];

    // Apply search
    if (searchTerm && searchFields) {
      result = this.searchItems(result, searchTerm, searchFields);
    }

    // Apply filters
    if (filters) {
      result = this.filterItems(result, filters);
    }

    // Apply sorting
    if (sortBy) {
      result = this.sortItems(result, sortBy, sortOrder);
    }

    return result;
  }
}

// Global search manager instance
const searchManager = new SearchManager();

// Utility functions for specific page searches
function setupMedicationSearch() {
  const searchInput = document.getElementById('medicationSearch');
  const typeFilter = document.getElementById('medicationTypeFilter');
  const statusFilter = document.getElementById('medicationStatusFilter');

  if (!searchInput) return;

  const performSearch = searchManager.debounce(() => {
    const searchTerm = searchInput.value;
    const typeValue = typeFilter ? typeFilter.value : '';
    const statusValue = statusFilter ? statusFilter.value : '';

    const medications = dataManager.getMedications() || [];
    const filtered = searchManager.processItems(medications, {
      searchTerm,
      searchFields: ['name', 'condition', 'prescribedBy'],
      filters: {
        type: typeValue,
        status: statusValue
      },
      sortBy: 'name',
      sortOrder: 'asc'
    });

    renderMedicationList(filtered);
  }, 300);

  searchInput.addEventListener('input', performSearch);
  if (typeFilter) typeFilter.addEventListener('change', performSearch);
  if (statusFilter) statusFilter.addEventListener('change', performSearch);
}

function setupDoctorSearch() {
  const searchInput = document.querySelector('.search-bar input');

  if (!searchInput) return;

  const performSearch = searchManager.debounce(() => {
    const searchTerm = searchInput.value;
    const doctors = getDoctorsData(); // This would be implemented in doctors.js

    const filtered = searchManager.processItems(doctors, {
      searchTerm,
      searchFields: ['name', 'specialty', 'hospital', 'location'],
      sortBy: 'name',
      sortOrder: 'asc'
    });

    renderDoctors(filtered);
  }, 300);

  searchInput.addEventListener('input', performSearch);
}

function setupHistorySearch() {
  const searchInput = document.getElementById('historySearch');
  const dateFilter = document.getElementById('historyDateFilter');
  const statusFilter = document.getElementById('historyStatusFilter');

  if (!searchInput) return;

  const performSearch = searchManager.debounce(() => {
    const searchTerm = searchInput.value;
    const dateValue = dateFilter ? dateFilter.value : '';
    const statusValue = statusFilter ? statusFilter.value : '';

    const history = dataManager.getMedicationHistory() || [];
    const filtered = searchManager.processItems(history, {
      searchTerm,
      searchFields: ['medicationName', 'notes'],
      filters: {
        date: dateValue,
        status: statusValue
      },
      sortBy: 'date',
      sortOrder: 'desc'
    });

    renderHistory(filtered);
  }, 300);

  searchInput.addEventListener('input', performSearch);
  if (dateFilter) dateFilter.addEventListener('change', performSearch);
  if (statusFilter) statusFilter.addEventListener('change', performSearch);
}

function setupHospitalSearch() {
  const searchInput = document.getElementById('hospitalSearch');
  const typeFilter = document.getElementById('hospitalTypeFilter');

  if (!searchInput) return;

  const performSearch = searchManager.debounce(() => {
    const searchTerm = searchInput.value;
    const typeValue = typeFilter ? typeFilter.value : '';

    const hospitals = getHospitalsData(); // This would be implemented in hospitals.js

    const filtered = searchManager.processItems(hospitals, {
      searchTerm,
      searchFields: ['name', 'address', 'specialties'],
      filters: {
        type: typeValue
      },
      sortBy: 'name',
      sortOrder: 'asc'
    });

    renderHospitals(filtered);
  }, 300);

  searchInput.addEventListener('input', performSearch);
  if (typeFilter) typeFilter.addEventListener('change', performSearch);
}

// Initialize search functionality based on current page
function initializeSearch() {
  const currentPage = window.location.pathname.split('/').pop();

  switch(currentPage) {
    case 'medications.html':
      setupMedicationSearch();
      break;
    case 'doctors.html':
      setupDoctorSearch();
      break;
    case 'history.html':
      setupHistorySearch();
      break;
    case 'hospitals.html':
      setupHospitalSearch();
      break;
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', initializeSearch);
