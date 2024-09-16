const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');

const { createTopMenu } = require('./menus/top.menu');
const { loadDatabase, getTrackById } = require('./services/persistence.services');
const { openFiles, checkFileAccess } = require('./services/files.services');

// Global variables
let mainWindow;
const isMac = process.platform === 'darwin';

// Functions
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 780,
        minWidth: 1280,
        minHeight: 780,
        transparent: true,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    
    mainWindow.loadFile(path.join(__dirname, 'app/index.html'));
    
    mainWindow.on('ready-to-show', async () => {
        mainWindow.show();
        /* mainWindow.webContents.openDevTools(); */ // dev mode
        await loadFromDatabase();
    });

    ipcMain.on('minApp', () => {
        mainWindow.minimize();
    });

    ipcMain.on('maxApp', () => {
        if(mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('closeApp', () => {
        mainWindow.close();
    });
};

const loadFromDatabase = async () => {
    try {
        const loadedData = await loadDatabase();
        mainWindow.webContents.send('addFilesToPlaylist', loadedData);
        
    } catch (error) {
        console.error(error)
    };
};

// Main process
app.whenReady().then(() => {
    createMainWindow();
    createTopMenu(isMac, mainWindow);
    

    mainWindow.on('closed', () => (mainWindow = null));

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });

    app.on('window-all-closed', () => {
        if (!isMac) app.quit()
    });
});


// IPC
ipcMain.on('tryToAddFile', () => {
    openFiles(mainWindow);
});

ipcMain.handle('checkFilePath', async (event, filePath) => {
    try {
        return await checkFileAccess(filePath);
    } catch (error) {
        console.error(error);
    }
});

ipcMain.handle('requestTrackData', async (event, id) => {
    try {
        return await getTrackById(id);
    } catch (error) {
        console.error(error);
    }
});