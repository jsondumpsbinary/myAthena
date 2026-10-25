
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

let win;
let allowQuit = false;

// Create the application window.
function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'myAthena',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  } else {
    win.loadURL('http://127.0.0.1:5173');
  }

  // Prevent Escape from exiting full-screen mode.
  win.webContents.on('before-input-event', (event, input) => {
    if (
      win.isFullScreen() &&
      input.key === 'Escape' &&
      input.type === 'keyDown'
    ) {
      event.preventDefault();
    }
  });
}

// Save photos.
ipcMain.handle('save-photo', async (event, imageData) => {
  if (
    typeof imageData !== 'string' ||
    !imageData.startsWith('data:image/jpeg;base64,')
  ) {
    throw new Error('Invalid JPEG image data.');
  }

  const base64Data = imageData.split(',')[1];
  const photoBuffer = Buffer.from(base64Data, 'base64');

  const photosDirectory = app.isPackaged
    ? path.join(app.getPath('userData'), 'photos')
    : path.join(app.getAppPath(), 'photos');

  await fs.mkdir(photosDirectory, { recursive: true });

  const filename = `myathena-${Date.now()}.jpg`;
  const filePath = path.join(photosDirectory, filename);

  await fs.writeFile(filePath, photoBuffer);

  return {
    success: true,
    filename,
    filePath,
  };
});

// Ask before entering full-screen mode.
async function requestFullScreen() {
  const result = await dialog.showMessageBox(win, {
    type: 'warning',
    title: 'Enter Full Screen',
    message: 'Are you ready to enter full-screen test mode?',
    detail:
      'You will not be able to exit using the Escape key. Press Command + Q if you need to quit.',
    buttons: ['Cancel', 'Enter Full Screen'],
    defaultId: 1,
    cancelId: 0,
    noLink: true,
  });

  if (result.response === 1) {
    win.setFullScreen(true);
    return true;
  }

  return false;
}

// React calls this through the preload API.
ipcMain.handle('request-full-screen', async () => {
  console.log('Full-screen IPC request received');

  try {
    const result = await requestFullScreen();

    console.log('Full-screen dialog result:', result);

    return result;
  } catch (error) {
    console.error('Full-screen request failed:', error);
    throw error;
  }
});;

// Ask before quitting the app.
app.on('before-quit', (event) => {
  if (allowQuit) return;

  event.preventDefault();

  const result = dialog.showMessageBoxSync(win, {
    type: 'warning',
    title: 'Quit Test?',
    message: 'Are you sure you want to quit the test?',
    detail: 'Your test session will be interrupted if you quit.',
    buttons: ['Cancel', 'Quit Test'],
    defaultId: 0,
    cancelId: 0,
    noLink: true,
  });

  if (result === 1) {
    allowQuit = true;
    app.quit();
  }
});

// Start the app.
app.whenReady().then(createWindow);
