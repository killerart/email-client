/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  shell,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Mail from 'nodemailer/lib/mailer';
import SmtpClient, { SmtpCredentials } from './lib/SmtpClient';
import ImapClient, { ImapCredentials } from './lib/ImapClient';
import { IpcActions } from './lib/IpcActions';
import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

async function getAllMessages(
  event: IpcMainInvokeEvent,
  credentials: ImapCredentials
) {
  const imapClient = ImapClient.getInstance();
  await imapClient.openConnection(credentials, (message) =>
    event.sender.send(IpcActions.NEW_MESSAGE, message)
  );

  const messages = await imapClient.listMessages(-100);
  return messages.reverse();
}

async function getMessage(
  event: IpcMainInvokeEvent,
  credentials: ImapCredentials,
  uid: number
) {
  const imapClient = ImapClient.getInstance();
  await imapClient.openConnection(credentials, (message) =>
    event.sender.send(IpcActions.NEW_MESSAGE, message)
  );

  const message = await imapClient.getMessage(uid);
  await imapClient.addSeenFlag(uid);
  return message;
}

function sendMessage(
  _: IpcMainInvokeEvent,
  credentials: SmtpCredentials,
  message: Mail.Options
) {
  const smtpClient = SmtpClient.getInstance();
  smtpClient.openConnection(credentials);

  message.from = credentials.email;
  return smtpClient.sendMail(message);
}

function closeConnections() {
  ImapClient.getInstance().closeConnection();
  SmtpClient.getInstance().closeConnection();
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    closeConnections();
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

/**
 * Network events...
 */
ipcMain.handle(IpcActions.GET_ALL_MESSAGES, getAllMessages);

ipcMain.handle(IpcActions.GET_MESSAGE, getMessage);

ipcMain.handle(IpcActions.SEND_MESSAGE, sendMessage);

ipcMain.handle(IpcActions.LOGOUT, closeConnections);
