/**
 * Prague Shared Flats - Main Application
 * Handles property listings, filters, search, and map interactions
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const appState = {
  allProperties: [],
  filteredProperties: [],
  currentFilter: 'all',
  currentSort: 'default',
  map: null,
  markers: [],
  isMobileMenuOpen: false,
  lastScrollY: 0
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initializing...');
  
  setDefaultDates();
  loadProperties();
  initializeEventListeners();
  initializeScroll();
  
  console.log('App ready!');
});

// ============================================
// PROPERTY DATA MANAGEMENT
// ============================================

/**
 * Fetch and load properties from JSON
 */
async function loadProperties() {
  try {
    const response = await fetch('./data/properties.json');
    if (!response.ok) throw new Error('Failed to load properties');
    
    appState.allProperties = await response.json();
    appState.filteredProperties = [...appState.allProperties];
    
    renderProperties();
    initializeMap();
    
    console.log(`Loaded ${appState.allProperties.length} properties`);
  } catch (error) {
    console.error('Error loading properties:', error);
    showErrorMessage('Failed to load properties. Please try again later.');
  }
}

/**
 * Render properties to the DOM
 */
function renderProperties() {
  const grid = document.querySelector('.properties-grid');
  if (!grid) return;
  
  // Clear existing cards
  grid.innerHTML = '';
  
  // Handle empty state
  if (appState.filteredProperties.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; padding: 60px 20px; text-align: center;"><p style="font-size: 18px; color: #666;">No properties match your criteria. Try adjusting your filters.</p></div>';
    return;
  }
  
  // Create property cards
  appState.filteredProperties.forEach((property, index) => {
    const card = createPropertyCard(property);
    card.style.animationDelay = `${index * 50}ms`;
    grid.appendChild(card);
  });
}

/**
 * Create a property card element
 * @param {Object} property - Property data
 * @returns {HTMLElement} Property card element
 */
function createPropertyCard(property) {
  const card = document.createElement('div');
  card.className = 'property-card';
  
  const pricePerSqm = Math.round(property.price / property.size);
  
  card.innerHTML = `
    <div class="property-image">
      <img src="${property.image}" alt="${property.title}" onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
      <div class="property-overlay">
        <button class="view-details-btn" data-property-id="${property.id}">View Details</button>
      </div>
      <span class="property-badge">${property.type}</span>
    </div>
    <div class="property-content">
      <h3 class="property-title">${escapeHtml(property.title)}</h3>
      <p class="property-location">📍 ${escapeHtml(property.address)}</p>
      <div class="property-features">
        <div class="property-feature">
          <span class="property-feature-value">${property.rooms}</span>
          <span class="property-feature-label">Rooms</span>
        </div>
        <div class="property-feature">
          <span class="property-feature-value">${property.size}</span>
          <span class="property-feature-label">m²</span>
        </div>
        <div class="property-feature">
          <span class="property-feature-value">$${pricePerSqm}</span>
          <span class="property-feature-label">per m²</span>
        </div>
      </div>
      <div class="property-price">$${property.price.toLocaleString()} / month</div>
      <button class="property-button" onclick="handlePropertySelect(${property.id})">Reserve Now</button>
    </div>
  `;
  
  return card;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// FILTERING & SORTING
// ============================================

/**
 * Filter properties by room count
 * @param {string} filter - Filter type (all, 2-rooms, 3-rooms, 4plus-rooms)
 */
function filterByRooms(filter) {
  appState.currentFilter = filter;
  
  // Update active button state
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  applyFilters();
}

/**
 * Apply all active filters and sorts
 */
function applyFilters() {
  let filtered = [...appState.allProperties];
  
  // Apply room filter
  if (appState.currentFilter !== 'all') {
    filtered = filtered.filter(prop => {
      if (appState.currentFilter === '2-rooms') return prop.rooms === 2;
      if (appState.currentFilter === '3-rooms') return prop.rooms === 3;
      if (appState.currentFilter === '4plus-rooms') return prop.rooms >= 4;
      return true;
    });
  }
  
  // Apply type filter from search
  const typeSelect = document.querySelector('select[name="type"]');
  if (typeSelect && typeSelect.value !== '') {
    filtered = filtered.filter(prop => prop.type === typeSelect.value);
  }
  
  // Apply sort
  filtered = applySorting(filtered);
  
  appState.filteredProperties = filtered;
  renderProperties();
  updateMapMarkers();
}

/**
 * Apply sorting to properties
 * @param {Array} properties - Properties to sort
 * @returns {Array} Sorted properties
 */
function applySorting(properties) {
  const sorted = [...properties];
  
  switch (appState.currentSort) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rooms-most':
      return sorted.sort((a, b) => b.rooms - a.rooms);
    default:
      return sorted;
  }
}

/**
 * Handle sort change
 * @param {string} sortType - Sort type (price-low, price-high, rooms-most)
 */
function handleSort(sortType) {
  appState.currentSort = sortType;
  applyFilters();
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

/**
 * Handle search form submission
 */
function handleSearch(event) {
  event?.preventDefault?.();
  
  const checkIn = document.querySelector('input[name="check-in"]')?.value;
  const checkOut = document.querySelector('input[name="check-out"]')?.value;
  
  if (!checkIn || !checkOut) {
    showErrorMessage('Please select both check-in and check-out dates.');
    return;
  }
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  if (checkInDate >= checkOutDate) {
    showErrorMessage('Check-out date must be after check-in date.');
    return;
  }
  
  console.log(`Search: Check-in: ${checkIn}, Check-out: ${checkOut}`);
  applyFilters();
  
  // Scroll to results
  document.querySelector('.properties')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Handle property selection
 * @param {number} propertyId - Property ID
 */
function handlePropertySelect(propertyId) {
  const property = appState.allProperties.find(p => p.id === propertyId);
  if (property) {
    console.log('Selected property:', property);
    alert(`You've selected: ${property.title}\nPrice: $${property.price}/month`);
    // In a real app, this would redirect to booking or show a modal
  }
}

// ============================================
// DATE MANAGEMENT
// ============================================

/**
 * Set default dates (today and +6 months)
 */
function setDefaultDates() {
  const today = new Date();
  const sixMonthsLater = new Date(today.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
  
  const checkInInput = document.querySelector('input[name="check-in"]');
  const checkOutInput = document.querySelector('input[name="check-out"]');
  
  if (checkInInput) {
    checkInInput.value = formatDateForInput(today);
    checkInInput.min = formatDateForInput(today);
  }
  
  if (checkOutInput) {
    checkOutInput.value = formatDateForInput(sixMonthsLater);
  }
}

/**
 * Format date for HTML input[type="date"]
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (YYYY-MM-DD)
 */
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================
// MAP FUNCTIONALITY (LEAFLET)
// ============================================

/**
 * Initialize Leaflet map
 */
function initializeMap() {
  const mapContainer = document.querySelector('.map-container');
  if (!mapContainer) return;
  
  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.warn('Leaflet library not loaded. Please include it in your HTML.');
    mapContainer.innerHTML = '<p style="padding: 20px; color: #666;">Map library not available. Please include Leaflet.js.</p>';
    return;
  }
  
  // Prague center coordinates
  const pragueCenter = [50.0755, 14.4378];
  
  // Remove existing map if present
  if (appState.map) {
    appState.map.remove();
  }
  
  // Initialize map
  appState.map = L.map(mapContainer).setView(pragueCenter, 12);
  
  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(appState.map);
  
  // Clear old markers
  appState.markers.forEach(marker => marker.remove());
  appState.markers = [];
  
  // Add markers for all properties
  appState.allProperties.forEach(property => {
    addPropertyMarker(property);
  });
  
  console.log('Map initialized with', appState.markers.length, 'markers');
}

/**
 * Add a marker to the map
 * @param {Object} property - Property data
 */
function addPropertyMarker(property) {
  if (!appState.map) return;
  
  const marker = L.marker([property.latitude, property.longitude])
    .bindPopup(`
      <div style="font-family: Inter, sans-serif;">
        <strong>${escapeHtml(property.title)}</strong><br>
        ${escapeHtml(property.address)}<br>
        <strong>$${property.price}/month</strong><br>
        <a href="#" onclick="handlePropertySelect(${property.id}); return false;" style="color: #0066FF; text-decoration: underline;">View Details →</a>
      </div>
    `)
    .addTo(appState.map);
  
  appState.markers.push(marker);
}

/**
 * Update map markers to show only filtered properties
 */
function updateMapMarkers() {
  if (!appState.map) return;
  
  // Hide all markers
  appState.markers.forEach(marker => marker.setOpacity(0.3));
  
  // Show markers for filtered properties
  appState.filteredProperties.forEach(property => {
    const marker = appState.markers.find(m => 
      m.getLatLng().lat === property.latitude && 
      m.getLatLng().lng === property.longitude
    );
    if (marker) marker.setOpacity(1);
  });
}

// ============================================
// MOBILE MENU
// ============================================

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.navbar-menu');
  
  if (hamburger && navMenu) {
    appState.isMobileMenuOpen = !appState.isMobileMenuOpen;
    hamburger.classList.toggle('active', appState.isMobileMenuOpen);
    navMenu.classList.toggle('hidden', !appState.isMobileMenuOpen);
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  appState.isMobileMenuOpen = false;
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.navbar-menu');
  
  if (hamburger) hamburger.classList.remove('active');
  if (navMenu) navMenu.classList.add('hidden');
}

// ============================================
// SCROLL ANIMATIONS & BEHAVIORS
// ============================================

/**
 * Initialize scroll event listeners
 */
function initializeScroll() {
  // Navbar hide/show on scroll
  window.addEventListener('scroll', handleNavbarScroll);
  
  // Scroll animations
  window.addEventListener('scroll', handleScrollAnimations);
  
  // Smooth scroll for anchor links
  initializeSmoothScroll();
}

/**
 * Handle navbar show/hide on scroll
 */
function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  const currentScrollY = window.scrollY;
  
  // Add scrolled class when scrolled down
  if (currentScrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  appState.lastScrollY = currentScrollY;
}

/**
 * Handle fade-in animations on scroll using Intersection Observer
 */
function handleScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-on-scroll');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });
  
  // Observe all elements with animation-ready class
  document.querySelectorAll('.feature-card, .property-card, .step-card').forEach(el => {
    if (!el.classList.contains('fade-in-on-scroll')) {
      observer.observe(el);
    }
  });
}

/**
 * Initialize smooth scroll for anchor links
 */
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        closeMobileMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============================================
// EVENT LISTENERS INITIALIZATION
// ============================================

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterByRooms(btn.dataset.filter);
    });
  });
  
  // Sort select
  const sortSelect = document.querySelector('select[name="sort"]');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => handleSort(e.target.value));
  }
  
  // Search button
  const searchBtn = document.querySelector('button[type="submit"]');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }
  
  // Search input form
  const searchForm = document.querySelector('form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  
  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }
  
  // Close mobile menu when clicking on a link
  document.querySelectorAll('.navbar-menu a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
  
  // Type filter
  const typeSelect = document.querySelector('select[name="type"]');
  if (typeSelect) {
    typeSelect.addEventListener('change', applyFilters);
  }
  
  // View details buttons (event delegation)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-details-btn')) {
      const propertyId = parseInt(e.target.dataset.propertyId);
      handlePropertySelect(propertyId);
    }
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show error message to user
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
  console.error(message);
  
  // Create a simple alert or toast notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    font-family: Inter, sans-serif;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Log app state for debugging
 */
function logAppState() {
  console.table({
    'Total Properties': appState.allProperties.length,
    'Filtered Properties': appState.filteredProperties.length,
    'Current Filter': appState.currentFilter,
    'Current Sort': appState.currentSort,
    'Mobile Menu Open': appState.isMobileMenuOpen
  });
}

// ============================================
// EXPORT FOR TESTING (optional)
// ============================================

// Make functions available globally for debugging
window.app = {
  logAppState,
  handleSearch,
  handleSort,
  filterByRooms,
  handlePropertySelect,
  toggleMobileMenu
};
