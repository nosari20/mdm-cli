console.log('Node : '+process.version);
console.log('Chomium : '+process.versions['chrome']);
const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const ipc = require('electron').ipcMain
const tls = require('./helpers/tls')
const https = require('./helpers/https');

let win;

function createWindow() {
  win = new BrowserWindow({ 
    width: 800, 
    height: 600 , 
    frame: false,
    webPreferences: { webSecurity: false }
    
  });
  initIPC();   

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `../dist/cli/index.html`),
      protocol: "file:",
      slashes: true
    })
    
  );
  
  // The following is optional and will open the DevTools:
  //win.webContents.openDevTools()

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// initialize the app's main window
app.on("activate", () => {
  if (win === null) {
    createWindow(); 
  }
});


function initIPC(){
  ipc_ssl();
  ipc_https();

}

function ipc_ssl(){
  ipc.on('ssl', function (event, serverJSON) {
    let server = JSON.parse(serverJSON);
    tls.check(server.host, server.port, server.timeout).then((certificate)=>{
      win.webContents.send('ssl', JSON.stringify(certificate));
    });
  }) 
}

function ipc_https(){
  ipc.on('https', function (event, serverJSON) {
    let server = JSON.parse(serverJSON);
    https.get(server.url, server.timeout).then((res)=>{
      win.webContents.send('https', JSON.stringify(res));
    });
  })
}
