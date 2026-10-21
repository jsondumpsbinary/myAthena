const { app, BrowserWindow } = require('electron');
require('./index.css');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'myAthena',
  });

  win.loadURL('http://127.0.0.1:5173');
}

app.whenReady().then(() => {
  createWindow();
});