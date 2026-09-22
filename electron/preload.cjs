const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  activateSuccess: (payload) => ipcRenderer.send('activate-success', payload),
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  getHwid: () => ipcRenderer.invoke('get-hwid')
});
