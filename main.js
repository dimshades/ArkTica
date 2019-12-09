// 引入electron并创建一个BrowserWindow
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const Store = require('electron-store')

/* 主窗口 */
let mainWindow
let mainWindowConfig = {
  width: 880,
  height: 640,
  frame: true,
  webPreferences: { nodeIntegration: true }
}
let productionRouteConfig = {
  pathname: path.join(__dirname, 'index.html'),
  protocol: 'file:',
  slashes: true
}

function createWindow() {
  mainWindow = new BrowserWindow(mainWindowConfig)
  mainWindow.setMenu(null)

  if (process.NODE_ENV === 'production') {
    mainWindow.loadURL(url.format(productionRouteConfig))
  } else {
    mainWindow.loadURL('http://localhost:3000/editor')
    mainWindow.webContents.openDevTools() // 打开开发者工具
  }

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

/* ---- 注册新窗口监听 ---- */

// 新的编辑器窗口
let editorWindow
function createEditorWindow() {
  editorWindow = new BrowserWindow({ width: 640, height: 800, frame: false, parent: mainWindow })

  // 测试:开发下加载
  editorWindow.loadURL('http://localhost:3000/editor')

  // 真实路径: 目前不存在
  // editorWindow.loadURL(path.join('file', __dirname, 'editor.html')) // 新窗口渲染进程文件
  editorWindow.on('closed', () => (editorWindow = null))
}
ipcMain.on('newEditorWindow', createEditorWindow)

/* ---- 启动程序 ---- */

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', createWindow)

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function() {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})

/*  文件本地持久化*/

function handleStoreFile(json) {
  const appPath = app.getPath()
  console.log(appPath)
  // const schema = {
  //   log:{}
  // }
  const store = new Store({
    cwd: './files/diary'
  })
  store.set('unicorn', json.log)

  // other usages

  // Use dot-notation to access nested properties
  // store.set('foo.bar', true)
  // store.delete('unicorn');
}
ipcMain.on('storeLocal', handleStoreFile)