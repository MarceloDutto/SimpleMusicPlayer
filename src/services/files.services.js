const { dialog } = require('electron');
const fs = require('fs').promises;
const { createTracks } = require('./persistence.services');

const openFiles = async (window) => {
    try {
        const result = await dialog.showOpenDialog(window, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                {
                    name: 'Music files',
                    extensions: ['mp3', 'wav', 'ogg']
                }
            ]
        });

        if(result.canceled || !result.filePaths || result.filePaths.length === 0) return;

        const newFiles = await createTracks(result.filePaths);
        window.webContents.send('addFilesToPlaylist', newFiles);
    } catch (error) {
        console.error(error);
    }
};

const openFolder = async (window) => {
    try {
        const result = await dialog.showOpenDialog(window, {
            properties: ['openDirectory'],
            filters: [
                {
                    name: 'Music files',
                    extensions: ['mp3', 'wav', 'ogg']
                }
            ]
        });

        if(result.canceled || !result.filePaths || result.filePaths.length === 0) return;

        const folderPath = result.filePaths[0];
        const folderFiles = await fs.readdir(folderPath);
        const files = [];

        folderFiles.forEach(e => {
            const elementPath = `${folderPath}/${e}`;
            files.push(elementPath);
        });

        const newFiles = await createTracks(files);
        window.webContents.send('addFilesToPlaylist', newFiles);
    } catch (error) {
        console.error(error);
    }
};

const checkFileAccess = async (filePath) => {
    try {
        await fs.access(filePath, fs.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    };
};

module.exports = { openFiles, openFolder, checkFileAccess };