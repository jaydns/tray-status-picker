const { Plugin } = require('powercord/entities');

const { ipcRenderer } = require('electron');
const { getModule, i18n: { Messages } } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const tray = getModule([ 'setSystemTrayApplications' ], false);

const customTrayItems = [
  {
    name: Messages.STATUS_ONLINE,
    id: 'status_online'
  },
  {
    name: Messages.STATUS_IDLE,
    id: 'status_idle'
  },
  {
    name: Messages.STATUS_DND,
    id: 'status_dnd'
  },
  {
    name: Messages.STATUS_OFFLINE,
    id: 'status_invisible'
  }
];

let changeStatus;

module.exports = class TrayStatusPicker extends Plugin {
  async startPlugin () {
    const settings = await getModule([ 'updateRemoteSettings' ]);

    inject('tray-status-picker', tray, 'setSystemTrayApplications', () => [ customTrayItems ], true);

    changeStatus = (_, id) => {
      if (id.startsWith('status_')) {
        settings.updateRemoteSettings({ status: id.substring(7, id.length) });
      }
    };

    ipcRenderer.on('DISCORD_LAUNCH_APPLICATION', changeStatus);

    tray.setSystemTrayApplications(customTrayItems);
  }

  pluginWillUnload () {
    uninject('tray-status-picker');
    if (typeof changeStatus === 'function') {
      ipcRenderer.removeListener('DISCORD_LAUNCH_APPLICATION', changeStatus);
    }
    tray.setSystemTrayApplications([]);
  }
};
