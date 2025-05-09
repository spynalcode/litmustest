// app.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const browseView = document.getElementById('browseView');
    const dashboardView = document.getElementById('dashboardView');
    const browseBtn = document.getElementById('browseBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const dappsGrid = document.getElementById('dappsGrid');
    const dashboardContent = document.getElementById('dashboardContent');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Current view state
    let currentView = 'browse';
    
    // Initialize the app
    init();
    
    function init() {
      // Load user dashboard from localStorage
      loadUserDashboard();
      
      // Render all DApps initially
      renderDApps(dappsData);
      
      // Set up event listeners
      browseBtn.addEventListener('click', () => switchView('browse'));
      dashboardBtn.addEventListener('click', () => switchView('dashboard'));
      searchInput.addEventListener('input', filterDApps);
      categoryFilter.addEventListener('change', filterDApps);
    }
    
    function switchView(view) {
      if (view === currentView) return;
      
      currentView = view;
      
      if (view === 'browse') {
        browseView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
      } else {
        browseView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        renderDashboard();
      }
    }
    
    function renderDApps(dapps) {
      dappsGrid.innerHTML = '';
      
      Object.entries(dapps).forEach(([id, dapp]) => {
        const dappCard = createDAppCard(id, dapp);
        dappsGrid.appendChild(dappCard);
      });
    }
    
    function createDAppCard(id, dapp) {
      const card = document.createElement('div');
      card.className = 'dapp-card';
      
      card.innerHTML = `
        <img src="${dapp.logo}" alt="${dapp.name} Logo" class="dapp-logo">
        <div class="dapp-info">
          <h3 class="dapp-name">${dapp.name}</h3>
          <span class="dapp-category">${dapp.category}</span>
          <p class="dapp-description">${dapp.description}</p>
          <div class="dapp-funds">${dapp.fundsRaised}</div>
          <div class="dapp-actions">
            <button class="test-btn" data-id="${id}">Test</button>
            <button class="dashboard-btn ${dapp.addedToDashboard ? 'added' : ''}" data-id="${id}">
              ${dapp.addedToDashboard ? 'Added' : 'Add to Dashboard'}
            </button>
          </div>
        </div>
      `;
      
      // Add event listeners to the buttons
      card.querySelector('.test-btn').addEventListener('click', () => testDApp(id));
      card.querySelector('.dashboard-btn').addEventListener('click', () => toggleDashboard(id));
      
      return card;
    }
    
    function testDApp(id) {
      const dapp = dappsData[id];
      if (dapp && dapp.htmlFile) {
        window.open(dapp.htmlFile, '_blank');
      } else if (dapp.testnetUrls) {
        // Open the first available testnet URL
        const firstNetwork = Object.keys(dapp.testnetUrls)[0];
        window.open(dapp.testnetUrls[firstNetwork], '_blank');
      }
    }
    
    function toggleDashboard(id) {
      dappsData[id].addedToDashboard = !dappsData[id].addedToDashboard;
      saveUserDashboard();
      renderDApps(dappsData);
      
      if (currentView === 'dashboard') {
        renderDashboard();
      }
    }
    
    function renderDashboard() {
      dashboardContent.innerHTML = '';
      
      const dashboardDApps = Object.entries(dappsData).filter(([_, dapp]) => dapp.addedToDashboard);
      
      if (dashboardDApps.length === 0) {
        dashboardContent.innerHTML = '<p>No DApps added to your dashboard yet. Browse DApps and add some!</p>';
        return;
      }
      
      dashboardDApps.forEach(([id, dapp]) => {
        const dappCard = createDAppCard(id, dapp);
        dashboardContent.appendChild(dappCard);
      });
    }
    
    function filterDApps() {
      const searchTerm = searchInput.value.toLowerCase();
      const category = categoryFilter.value;
      
      const filtered = Object.fromEntries(
        Object.entries(dappsData).filter(([_, dapp]) => {
          const matchesSearch = dapp.name.toLowerCase().includes(searchTerm) || 
                              dapp.description.toLowerCase().includes(searchTerm);
          const matchesCategory = category === 'all' || dapp.category === category;
          return matchesSearch && matchesCategory;
        })
      );
      
      renderDApps(filtered);
    }
    
    function loadUserDashboard() {
      const savedDashboard = localStorage.getItem('userDashboard');
      if (savedDashboard) {
        const dashboardIds = JSON.parse(savedDashboard);
        Object.keys(dappsData).forEach(id => {
          dappsData[id].addedToDashboard = dashboardIds.includes(id);
        });
      }
    }
    
    function saveUserDashboard() {
      const dashboardIds = Object.entries(dappsData)
        .filter(([_, dapp]) => dapp.addedToDashboard)
        .map(([id, _]) => id);
      
      localStorage.setItem('userDashboard', JSON.stringify(dashboardIds));
    }
  });