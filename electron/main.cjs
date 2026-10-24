
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

function createWindow() {
  const win = new BrowserWindow({
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
}

ipcMain.handle('save-photo', async (event, imageData) => {
  if (
    typeof imageData !== 'string' ||
    !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(imageData)
  ) {
    throw new Error('Invalid JPEG image data.');
  }

  const base64Data = imageData.replace(
    /^data:image\/jpeg;base64,/,
    ''
  );

  const photoBuffer = Buffer.from(base64Data, 'base64');

 const photosDirectory = app.isPackaged
  ? path.join(app.getPath('userData'), 'photos')
  : path.join(app.getAppPath(), 'photos');

  await fs.mkdir(photosDirectory, { recursive: true });

  const filename = `myathena-${Date.now()}.jpg`;
  const filePath = path.join(photosDirectory, filename);

  await fs.writeFile(filePath, photoBuffer);

  return { success: true, filename, filePath };
});

app.whenReady().then(createWindow);
