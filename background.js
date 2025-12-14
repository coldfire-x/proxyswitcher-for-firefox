// Background script for Proxy Switcher

let currentProxyConfig = null;

// Listen for messages from popup
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'switchProxy') {
    applyProxy(message.proxyId);
  }
});

// Initialize on startup
browser.runtime.onStartup.addListener(async () => {
  const result = await browser.storage.local.get('currentProxy');
  const currentProxy = result.currentProxy || 'direct';
  await applyProxy(currentProxy);
});

// Apply on install
browser.runtime.onInstalled.addListener(async () => {
  const result = await browser.storage.local.get('currentProxy');
  const currentProxy = result.currentProxy || 'direct';
  await applyProxy(currentProxy);
});

// Proxy request handler
function handleProxyRequest(requestInfo) {
  if (!currentProxyConfig) {
    return { type: 'direct' };
  }

  return currentProxyConfig;
}

// Register proxy request listener
browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ['<all_urls>'] });

// Apply proxy settings
async function applyProxy(proxyId) {
  console.log('Applying proxy:', proxyId);

  if (proxyId === 'direct') {
    // Clear proxy settings - direct connection
    currentProxyConfig = null;
    updateBadge('');
    console.log('Proxy disabled - using direct connection');
    return;
  }

  // Get proxy configuration
  const result = await browser.storage.local.get('proxies');
  const proxies = result.proxies || [];
  const proxy = proxies.find(p => p.id === proxyId);

  if (!proxy) {
    console.error('Proxy not found:', proxyId);
    return;
  }

  // Build proxy configuration
  currentProxyConfig = buildProxyConfig(proxy);

  updateBadge('ON');
  console.log('Proxy applied:', proxy.name, currentProxyConfig);
}

// Build proxy configuration object for Firefox proxy.onRequest
function buildProxyConfig(proxy) {
  const config = {
    host: proxy.host,
    port: proxy.port,
    proxyDNS: true
  };

  // Set proxy type
  switch (proxy.type) {
    case 'http':
      config.type = 'http';
      break;
    case 'https':
      config.type = 'https';
      break;
    case 'socks':
      config.type = 'socks';
      break;
    case 'socks5':
      config.type = 'socks';
      break;
    default:
      config.type = 'http';
  }

  // Add authentication if provided
  if (proxy.username && proxy.password) {
    config.username = proxy.username;
    config.password = proxy.password;
  }

  return config;
}

// Update extension badge
function updateBadge(text) {
  browser.browserAction.setBadgeText({ text });
  if (text === 'ON') {
    browser.browserAction.setBadgeBackgroundColor({ color: '#4CAF50' });
  }
}
