# Proxy Switcher for Firefox

A Firefox extension that allows you to quickly switch between different proxy configurations.

## Features

- Quick proxy switching with a single click
- Enable/disable proxies without deleting them
- Edit existing proxy configurations
- Support for multiple proxy types:
  - HTTP
  - HTTPS
  - SOCKS4
  - SOCKS5
- Save and manage multiple proxy configurations
- Clean and intuitive user interface
- Proxy authentication support (username/password)
- Visual status indicator showing active proxy
- Direct connection option (no proxy)

## Installation

### For Development/Testing

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the extension directory and select the `manifest.json` file
5. The extension will be loaded and appear in your toolbar

### For Production

1. Package the extension:
   - Navigate to the extension directory
   - Create a ZIP file containing all files:
     ```bash
     zip -r proxyswitcher.zip manifest.json background.js popup/ icons/
     ```

2. Submit to Firefox Add-ons:
   - Go to https://addons.mozilla.org/developers/
   - Sign in with your Firefox account
   - Submit the ZIP file for review

## Usage

### Adding a Proxy

1. Click the Proxy Switcher icon in your browser toolbar
2. Click the "+ Add Proxy" button
3. Fill in the proxy details:
   - **Name**: A friendly name for the proxy (e.g., "Office Proxy")
   - **Type**: Select the proxy protocol (HTTP, HTTPS, SOCKS4, or SOCKS5)
   - **Host**: The proxy server hostname or IP address
   - **Port**: The proxy server port number
   - **Username/Password**: (Optional) Credentials if the proxy requires authentication
4. Click "Save"

### Switching Proxies

1. Click the Proxy Switcher icon in your toolbar
2. Click on the proxy name to activate it
3. The active proxy will be highlighted in green
4. Click "Direct Connection" to disable all proxies

### Editing a Proxy

1. Click the Proxy Switcher icon
2. Click the "✎" (edit) button on the proxy you want to modify
3. Update the proxy details in the form
4. Click "Save" to apply the changes

### Enabling/Disabling a Proxy

1. Click the Proxy Switcher icon
2. Click the "●" (enabled) or "○" (disabled) button to toggle the proxy state
3. Disabled proxies appear greyed out and cannot be activated
4. Disabling the currently active proxy will switch to "Direct Connection"

### Deleting a Proxy

1. Click the Proxy Switcher icon
2. Click the "×" button on the proxy you want to remove
3. Confirm the deletion

## Project Structure

```
proxyswitcher/
├── manifest.json          # Extension manifest
├── background.js          # Background script for proxy management
├── popup/
│   ├── popup.html        # Extension popup UI
│   ├── popup.js          # Popup logic
│   └── popup.css         # Popup styling
└── icons/
    └── icon.svg          # Extension icon
```

## Permissions

The extension requires the following permissions:

- `proxy`: To manage browser proxy settings
- `storage`: To save proxy configurations
- `<all_urls>`: Required for proxy functionality

## Troubleshooting

### Proxy not working

- Verify the proxy server address and port are correct
- Check if the proxy requires authentication and credentials are entered correctly
- Some proxies may block certain types of traffic

### Extension not loading

- Make sure all files are in the correct directories
- Check the browser console for any error messages
- Verify the manifest.json is properly formatted

### Authentication issues

- Firefox handles proxy authentication differently than Chrome
- Some proxy servers may require additional configuration
- Try testing without authentication first

## Development

To modify the extension:

1. Make your changes to the source files
2. If testing with temporary add-on, click "Reload" in `about:debugging`
3. The changes will be applied immediately

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or feature requests, please open an issue on the project repository.
