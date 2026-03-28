import { contextBridge, ipcRenderer } from 'electron'

const handler = {
  setWindowIsReady: (isReady: boolean) => {
    ipcRenderer.send('window-is-ready', isReady)
  },
  onLauncherUrl: (callback: (url: string) => void) => {
    ipcRenderer.on('launcher-url', (_event, url: string) => {
      callback(url)
    })
  },
}

contextBridge.exposeInMainWorld('api', handler)

export type ApiHandler = typeof handler
