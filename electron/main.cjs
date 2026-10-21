const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'myAthena',
  });

  win.loadURL(
    'data:text/html;charset=utf-8,' +
      encodeURIComponent(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>myAthena</title>
          </head>
          <body>
            <h1>Welcome to myAthena!</h1>
            <p>My first Electron window is working.</p>
          </body>
        </html>
      `)
  );
}

app.whenReady().then(() => {
  createWindow();
});