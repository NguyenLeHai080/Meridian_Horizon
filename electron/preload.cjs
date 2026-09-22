const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  activateSuccess: (payload) => ipcRenderer.send('activate-success', payload),
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  getHwid: () => ipcRenderer.invoke('get-hwid'),
  getLicense: () => ipcRenderer.invoke('get-license'),
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  openPath: (targetPath) => ipcRenderer.invoke('open-path', targetPath)
});
