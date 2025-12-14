// Popup script for Proxy Switcher
let proxies = [];
let currentProxy = 'direct';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadProxies();
  await updateCurrentProxy();
  renderProxies();
  setupEventListeners();
});

// Load proxies from storage
async function loadProxies() {
  const result = await browser.storage.local.get(['proxies', 'currentProxy']);
  proxies = result.proxies || [];
  // Ensure all proxies have an enabled property (for backward compatibility)
  proxies = proxies.map(p => ({ ...p, enabled: p.enabled !== false }));
  currentProxy = result.currentProxy || 'direct';
}

// Update current proxy status
async function updateCurrentProxy() {
  const result = await browser.storage.local.get('currentProxy');
  currentProxy = result.currentProxy || 'direct';

  const statusText = document.getElementById('statusText');
  if (currentProxy === 'direct') {
    statusText.textContent = 'Direct Connection';
    statusText.className = 'status-direct';
  } else {
    const proxy = proxies.find(p => p.id === currentProxy);
    if (proxy) {
      statusText.textContent = `Active: ${proxy.name}`;
      statusText.className = 'status-active';
    }
  }
}

// Render proxy list
function renderProxies() {
  const proxyList = document.getElementById('proxyList');

  // Clear current list
  proxyList.innerHTML = '';

  // Add direct connection option
  const directItem = createProxyItem({
    id: 'direct',
    name: 'Direct Connection',
    details: 'No proxy',
    enabled: true
  });
  proxyList.appendChild(directItem);

  // Add saved proxies
  proxies.forEach(proxy => {
    const item = createProxyItem(proxy);
    proxyList.appendChild(item);
  });
}

// Create proxy list item
function createProxyItem(proxy) {
  const div = document.createElement('div');
  div.className = 'proxy-item';
  div.dataset.proxy = proxy.id;

  if (proxy.id === currentProxy) {
    div.classList.add('active');
  }

  // Add disabled class if proxy is disabled
  if (proxy.id !== 'direct' && proxy.enabled === false) {
    div.classList.add('disabled');
  }

  const details = proxy.id === 'direct'
    ? 'No proxy'
    : `${proxy.type.toUpperCase()} ${proxy.host}:${proxy.port}`;

  // Create proxy info section
  const proxyInfo = document.createElement('div');
  proxyInfo.className = 'proxy-info';

  const proxyName = document.createElement('div');
  proxyName.className = 'proxy-name';
  proxyName.textContent = proxy.name;

  const proxyDetails = document.createElement('div');
  proxyDetails.className = 'proxy-details';
  proxyDetails.textContent = details;

  proxyInfo.appendChild(proxyName);
  proxyInfo.appendChild(proxyDetails);

  // Add click listener to switch proxy (only for enabled proxies)
  proxyInfo.addEventListener('click', () => {
    if (proxy.id === 'direct' || proxy.enabled !== false) {
      switchProxy(proxy.id);
    }
  });

  // Create proxy actions section
  const proxyActions = document.createElement('div');
  proxyActions.className = 'proxy-actions';

  // Build action buttons for non-direct proxies
  if (proxy.id !== 'direct') {
    const toggleIcon = proxy.enabled === false ? '○' : '●';
    const toggleTitle = proxy.enabled === false ? 'Enable proxy' : 'Disable proxy';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-toggle';
    toggleBtn.dataset.id = proxy.id;
    toggleBtn.title = toggleTitle;
    toggleBtn.textContent = toggleIcon;
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProxy(proxy.id);
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.dataset.id = proxy.id;
    editBtn.title = 'Edit proxy';
    editBtn.textContent = '✎';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editProxy(proxy.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.dataset.id = proxy.id;
    deleteBtn.title = 'Delete proxy';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteProxy(proxy.id);
    });

    proxyActions.appendChild(toggleBtn);
    proxyActions.appendChild(editBtn);
    proxyActions.appendChild(deleteBtn);
  }

  const statusIndicator = document.createElement('span');
  statusIndicator.className = 'status-indicator';
  proxyActions.appendChild(statusIndicator);

  div.appendChild(proxyInfo);
  div.appendChild(proxyActions);

  return div;
}

// Switch to a proxy
async function switchProxy(proxyId) {
  // Check if trying to switch to a disabled proxy
  if (proxyId !== 'direct') {
    const proxy = proxies.find(p => p.id === proxyId);
    if (proxy && proxy.enabled === false) {
      alert('This proxy is disabled. Please enable it first.');
      return;
    }
  }

  currentProxy = proxyId;
  await browser.storage.local.set({ currentProxy: proxyId });

  // Send message to background script
  browser.runtime.sendMessage({
    action: 'switchProxy',
    proxyId: proxyId
  });

  // Update UI
  document.querySelectorAll('.proxy-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-proxy="${proxyId}"]`).classList.add('active');

  await updateCurrentProxy();
}

// Toggle proxy enabled/disabled
async function toggleProxy(proxyId) {
  const proxy = proxies.find(p => p.id === proxyId);
  if (!proxy) return;

  proxy.enabled = !proxy.enabled;
  await browser.storage.local.set({ proxies });

  // If disabled proxy was active, switch to direct
  if (!proxy.enabled && currentProxy === proxyId) {
    await switchProxy('direct');
  }

  renderProxies();
}

// Edit a proxy
function editProxy(proxyId) {
  const proxy = proxies.find(p => p.id === proxyId);
  if (!proxy) return;

  // Populate form with proxy data
  document.getElementById('formTitle').textContent = 'Edit Proxy';
  document.getElementById('editingProxyId').value = proxy.id;
  document.getElementById('proxyName').value = proxy.name;
  document.getElementById('proxyType').value = proxy.type;
  document.getElementById('proxyHost').value = proxy.host;
  document.getElementById('proxyPort').value = proxy.port;
  document.getElementById('proxyUsername').value = proxy.username || '';
  document.getElementById('proxyPassword').value = proxy.password || '';

  // Show form
  document.getElementById('addProxyForm').style.display = 'block';
  document.querySelector('.proxy-list').style.display = 'none';
  document.querySelector('.actions').style.display = 'none';
}

// Delete a proxy
async function deleteProxy(proxyId) {
  if (confirm('Are you sure you want to delete this proxy?')) {
    proxies = proxies.filter(p => p.id !== proxyId);
    await browser.storage.local.set({ proxies });

    // If deleted proxy was active, switch to direct
    if (currentProxy === proxyId) {
      await switchProxy('direct');
    }

    renderProxies();
  }
}

// Setup event listeners
function setupEventListeners() {
  const addProxyBtn = document.getElementById('addProxyBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const proxyForm = document.getElementById('proxyForm');

  addProxyBtn.addEventListener('click', () => {
    // Reset form for new proxy
    document.getElementById('formTitle').textContent = 'Add New Proxy';
    document.getElementById('editingProxyId').value = '';
    proxyForm.reset();

    document.getElementById('addProxyForm').style.display = 'block';
    document.querySelector('.proxy-list').style.display = 'none';
    document.querySelector('.actions').style.display = 'none';
  });

  cancelBtn.addEventListener('click', () => {
    document.getElementById('addProxyForm').style.display = 'none';
    document.querySelector('.proxy-list').style.display = 'block';
    document.querySelector('.actions').style.display = 'block';
    proxyForm.reset();
  });

  proxyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editingId = document.getElementById('editingProxyId').value;

    if (editingId) {
      // Update existing proxy
      const proxy = proxies.find(p => p.id === editingId);
      if (proxy) {
        proxy.name = document.getElementById('proxyName').value;
        proxy.type = document.getElementById('proxyType').value;
        proxy.host = document.getElementById('proxyHost').value;
        proxy.port = parseInt(document.getElementById('proxyPort').value);
        proxy.username = document.getElementById('proxyUsername').value;
        proxy.password = document.getElementById('proxyPassword').value;
      }
    } else {
      // Create new proxy
      const newProxy = {
        id: Date.now().toString(),
        name: document.getElementById('proxyName').value,
        type: document.getElementById('proxyType').value,
        host: document.getElementById('proxyHost').value,
        port: parseInt(document.getElementById('proxyPort').value),
        username: document.getElementById('proxyUsername').value,
        password: document.getElementById('proxyPassword').value,
        enabled: true
      };
      proxies.push(newProxy);
    }

    await browser.storage.local.set({ proxies });

    // If editing the currently active proxy, reapply it
    if (editingId && currentProxy === editingId) {
      await switchProxy(editingId);
    }

    // Hide form and show list
    document.getElementById('addProxyForm').style.display = 'none';
    document.querySelector('.proxy-list').style.display = 'block';
    document.querySelector('.actions').style.display = 'block';
    proxyForm.reset();

    renderProxies();
  });
}
