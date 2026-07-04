const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, Menu, net, protocol, shell } = require('electron');

const APP_ORIGIN = 'app://g8';
const DIST_DIR = path.join(__dirname, '..', 'dist');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function resolveDistFile(requestUrl) {
  const url = new URL(requestUrl);
  const requestedPath = decodeURIComponent(url.pathname);
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
  const filePath = path.normalize(path.join(DIST_DIR, relativePath));

  if (filePath.startsWith(DIST_DIR) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  return path.join(DIST_DIR, 'index.html');
}

function registerAppProtocol() {
  protocol.handle('app', (request) => {
    const filePath = resolveDistFile(request.url);
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'G8 Yacht Villa Operations',
    backgroundColor: '#172326',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.loadURL(`${APP_ORIGIN}/`);

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_ORIGIN)) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  registerAppProtocol();
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
