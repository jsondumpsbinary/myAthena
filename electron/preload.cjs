const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePhoto: (imageData) => ipcRenderer.invoke('save-photo', imageData),

  requestFullScreen: () =>
    ipcRenderer.invoke('request-full-screen'),
});