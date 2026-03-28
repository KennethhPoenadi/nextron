import path from 'path'
import { app, ipcMain, BrowserWindow } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers/create-window'

const isProd: boolean = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let windowIsReady = false
let mainWindow: BrowserWindow | null = null

const getMainWindowWhenReady = async () => {
  if (!windowIsReady) {
    await new Promise((resolve) => ipcMain.once('window-is-ready', resolve))
  }
  return mainWindow
}

;(async () => {
  const shouldContinue = checkLauncherUrl(getMainWindowWhenReady)
  if (!shouldContinue) return

  await app.whenReady()

  ipcMain.once('window-is-ready', () => {
    windowIsReady = true
  })

  mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

function checkLauncherUrl(getMainWindow: () => Promise<BrowserWindow | null>) {
  if (process.platform === 'darwin') {
    app.on('open-url', async (_event, url) => {
      const mainWindow = await getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send('launcher-url', url)
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
      }
    })
  }

  if (process.platform === 'win32') {
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
      return false
    }

    app.setAsDefaultProtocolClient('your-custom-protocol-scheme')

    app.on('second-instance', async (_event, args) => {
      const mainWindow = await getMainWindow()
      if (mainWindow) {
        const url = args.find((arg) =>
          arg.startsWith(`${'your-custom-protocol-scheme'}://`)
        )
        if (url) {
          mainWindow.webContents.send('launcher-url', url)
        }

        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.focus()
      }
    })

    const url = process.argv.find((arg) =>
      arg.startsWith(`${'your-custom-protocol-scheme'}://`)
    )
    if (url) {
      getMainWindow().then((mainWindow) => {
        if (mainWindow) {
          mainWindow.webContents.send('launcher-url', url)
        }
      })
    }
  }

  return true
}
