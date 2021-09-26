const { app, BrowserWindow, Menu, ipcMain , dialog} = require("electron");
const url = require("url");
const path = require("path");
const fs = require('fs');

var os = require('os');



let mainWindow;
let addWindow;
let selectedPath;

app.on('ready', function() {
  mainWindow = new BrowserWindow({
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: false,
          sandbox: false
      }
  });

  mainWindow.loadURL(url.format({
      pathname: path.join(__dirname,'index.html'),
      protocol: 'file:',
      slashes: true
  }));

  mainWindow.on('closed', function() {
      app.quit()
  })
  
  ipcMain.on('open-file',async function(event) {
      if(os.platform() === 'linux' || os.platform() === 'win32' ){
          var result = await dialog.showOpenDialog({
              properties: ['openDirectory']
          })
          if(!result.canceled){
              selectedPath = result.filePaths[0]
              const pat = getPath(result.filePaths[0])
              // console.log(pat)
              mainWindow.webContents.send('list', pat)  
          }
      } 
  })

  ipcMain.on('create-file', function() {
      createWindow()
  })

  ipcMain.on('createFile', function(e, name,type) {
      var filePath = `${selectedPath}/${name}`
      // var isCreate = false
      if(type == 'folder') {
        if (!fs.existsSync(filePath)){
            fs.mkdirSync(filePath);
            // console.log('create folder!'); 
            addWindow.close();
            const pat = getPath(selectedPath)
          // console.log(pat)
          mainWindow.webContents.send('list', pat)  
        } else {
          // console.log('file is exits')
          addWindow.webContents.send('isCreate', true)
        }
      } else {
        if(!fs.existsSync(filePath)) {
          fs.writeFile(filePath,'', function (err) {
            if (err) throw err;
            // console.log('create file!');  
            addWindow.close();
              const pat = getPath(selectedPath)
            // console.log(pat)
            mainWindow.webContents.send('list', pat)  
          });
        } else {
          //  console.log('file is exits')
           addWindow.webContents.send('isCreate', true)
        }
      }   
  })

});

const getPath = (filePath) => {
  // console.log(filePath)
  return fs.readdirSync(filePath)
    // .map(file => path.join(`${__dirname}/../`, file))
    // .filter(path1 =>fs.statSync(path.join(filePath, path1)).isDirectory());
}

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: 'Quit',
        click() {
          app.quit();
        }
      }
    ]
  }
]

function createWindow() {
  addWindow = new BrowserWindow({
    width: 200,
    height: 300,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: false,
        sandbox: false
    }
  });

    addWindow.loadURL(url.format({
      pathname: path.join(__dirname,'createFile.html'),
      protocol: 'file:',
      slashes: true
    }));

}