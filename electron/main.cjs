const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

const logPath = path.join(process.env.TEMP || '.', 'peipei_electron.log');
function log(msg) {
  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch(e) {}
}

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${err && err.stack ? err.stack : err}`);
});
process.on('unhandledRejection', (reason) => {
  log(`Unhandled Rejection: ${reason}`);
});

log('Electron main process started');

// 1. Kích hoạt tăng tốc phần cứng tối đa (Loại bỏ triệt để lag/giật)
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

let mainWindow = null;
let server = null;
let serverPort = 0;

function getLicenseFilePath() {
  const localAppData = process.env.LOCALAPPDATA || process.env.TEMP || '.';
  return path.join(localAppData, 'PeiPeiDub', 'license.json');
}

function isLicenseActive() {
  try {
    const licPath = getLicenseFilePath();
    if (fs.existsSync(licPath)) {
      const data = JSON.parse(fs.readFileSync(licPath, 'utf8'));
      if (data && data.license_key) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

// 2. Local Node.js Asynchronous Static Server (Siêu tốc, non-blocking, không bao giờ bị lag như Python)
function startLocalServer(distDir) {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf'
    };

    server = http.createServer((req, res) => {
      log(`[HTTP Request] ${req.method} ${req.url}`);
      try {
        let reqUrl = req.url.split('?')[0];
        let filePath = path.join(distDir, reqUrl);
        
        let isDir = false;
        try {
          if (fs.existsSync(filePath)) {
            isDir = fs.statSync(filePath).isDirectory();
          }
        } catch (e) {
          isDir = false;
        }

        if (!fs.existsSync(filePath) || isDir) {
          filePath = path.join(distDir, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
          if (err) {
            log(`[HTTP Error] Read error for ${filePath}: ${err}`);
            res.writeHead(404);
            res.end('File not found');
            return;
          }
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600'
          });
          res.end(data);
        });
      } catch (err) {
        log(`[HTTP Fatal Error] ${err}`);
        res.writeHead(500);
        res.end('Server error');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      log(`Local server listening on http://127.0.0.1:${serverPort}`);
      resolve(serverPort);
    });
  });
}

async function createWindow() {
  log('createWindow() called');
  const distDir = path.join(__dirname, 'dist');
  const port = await startLocalServer(distDir);
  const hasActiveLicense = isLicenseActive();
  log(`License active: ${hasActiveLicense}, port: ${port}`);

  let iconPath = path.join(__dirname, 'dist/icon.ico');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '../resources/icon.ico');
  }

  // Kích thước chuẩn: nếu chưa kích hoạt thì mở compact 560x660, nếu đã kích hoạt thì 1340x840
  const winWidth = hasActiveLicense ? 1340 : 560;
  const winHeight = hasActiveLicense ? 840 : 660;
  const winTitle = hasActiveLicense 
    ? 'PeiPei Dub Studio 1.5.73 - Dịch & Lồng tiếng Video' 
    : 'PeiPei Dub Studio 1.5.73 - Kích hoạt Bản quyền';

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    minWidth: hasActiveLicense ? 1040 : 520,
    minHeight: hasActiveLicense ? 680 : 620,
    title: winTitle,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0b0f17',
    autoHideMenuBar: true,
    show: false, // TUYỆT ĐỐI KHÔNG SHOW SỚM ĐỂ TRÁNH MÀN HÌNH ĐEN!
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      backgroundThrottling: false
    }
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    log(`[Renderer Console] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    log(`[Renderer Process Gone] reason: ${details.reason}, exitCode: ${details.exitCode}`);
  });

  mainWindow.once('ready-to-show', () => {
    log('mainWindow ready-to-show - showing window immediately');
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Fallback an toàn: nếu máy quá chậm sau 4000ms mới hiện
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      log('Fallback show timeout triggered after 4s');
      mainWindow.show();
      mainWindow.focus();
    }
  }, 4000);

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`WebContents did-fail-load: ${errorCode} - ${errorDescription}`);
    if (mainWindow) mainWindow.show();
  });

  const targetUrl = `http://127.0.0.1:${port}/tool`;
  log(`Loading URL: ${targetUrl}`);
  mainWindow.loadURL(targetUrl);

  // Cung cấp bản quyền đã lưu trên đĩa cho Renderer
  ipcMain.handle('get-license', () => {
    try {
      const licPath = getLicenseFilePath();
      if (fs.existsSync(licPath)) {
        const data = JSON.parse(fs.readFileSync(licPath, 'utf8'));
        log('get-license returned license data to renderer');
        return data;
      }
    } catch (e) {
      log('get-license error: ' + e);
    }
    return null;
  });

  // Xử lý sự kiện IPC Kích hoạt thành công
  ipcMain.on('activate-success', (event, payload) => {
    log(`activate-success received: ${JSON.stringify(payload)}`);
    if (payload) {
      try {
        const licPath = getLicenseFilePath();
        fs.mkdirSync(path.dirname(licPath), { recursive: true });
        fs.writeFileSync(licPath, JSON.stringify(payload, null, 2), 'utf8');
      } catch (e) {
        log('Error writing license: ' + e);
      }
    }

    if (mainWindow) {
      mainWindow.setMinimumSize(1040, 680);
      mainWindow.setSize(1340, 840, true);
      mainWindow.center();
      mainWindow.setTitle('PeiPei Dub Studio 1.5.73 - Dịch & Lồng tiếng Video');
    }
  });

  ipcMain.handle('open-file-dialog', async (event, opts = {}) => {
    try {
      const defaultFilters = opts.filters || [
        { name: 'Video Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'ts'] },
        { name: 'All Files', extensions: ['*'] }
      ];
      const result = await dialog.showOpenDialog(mainWindow, {
        title: opts.title || 'Chọn tệp video',
        properties: ['openFile'],
        filters: defaultFilters
      });
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const stats = fs.statSync(filePath);
        return {
          canceled: false,
          filePath: filePath,
          fileName: path.basename(filePath),
          size: stats.size
        };
      }
      return { canceled: true };
    } catch (e) {
      log('open-file-dialog error: ' + e);
      return { canceled: true, error: e.message };
    }
  });

  ipcMain.handle('save-file-dialog', async (event, opts = {}) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: opts.title || 'Lưu tệp phụ đề SRT',
        defaultPath: opts.defaultPath || 'output.srt',
        filters: opts.filters || [{ name: 'Subtitle Files', extensions: ['srt'] }]
      });
      if (!result.canceled && result.filePath) {
        if (opts.content) {
          fs.writeFileSync(result.filePath, opts.content, 'utf8');
        }
        return { canceled: false, filePath: result.filePath };
      }
      return { canceled: true };
    } catch (e) {
      log('save-file-dialog error: ' + e);
      return { canceled: true, error: e.message };
    }
  });

  ipcMain.handle('open-path', async (event, targetPath) => {
    try {
      if (targetPath) {
        await shell.openPath(targetPath);
        return true;
      }
    } catch (e) {
      log('open-path error: ' + e);
    }
    return false;
  });

  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  mainWindow.on('close', () => {
    log('mainWindow close event received');
  });

  mainWindow.on('closed', () => {
    log('mainWindow closed event fired');
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
