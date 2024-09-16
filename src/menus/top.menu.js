const { Menu } = require('electron');
const { openFiles, openFolder } = require('../services/files.services');

const createTopMenu = (isMac, window) => {
    const template = [
        // Mac App menu
        ...(isMac
            ? [{
                label: app.name,
                submenu: [
                    { role: 'about' }, // About modal!
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideOthers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            }]
            : []),
            // File 
            {
                label: '&File',
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {
                        label: 'Open file', 
                         click: () => openFiles(window)
                    },
                    {
                        label: 'Open folder',
                        click: () => openFolder(window)
                    },
                    {type: 'separator'},
                    {role: isMac ? 'close' : 'quit'},
                ]
            }
    ];   

    const topMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(topMenu);
};

module.exports = { createTopMenu };