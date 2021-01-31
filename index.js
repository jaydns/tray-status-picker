const { Plugin } = require('powercord/entities');

const { ipcRenderer } = require('electron');
const { getModule, i18n: { Messages } } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const tray = getModule([ 'setSystemTrayApplications' ], false);

module.exports = class TrayStatusPicker extends (
  Plugin
) {
  async startPlugin () {
    const settings = await getModule([ 'updateRemoteSettings' ]);

    const customTrayMenus = [
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

    inject('tray-status-picker', tray, 'setSystemTrayApplications', () => [ customTrayMenus ], true);

    ipcRenderer.on('DISCORD_LAUNCH_APPLICATION', (_, id) => {
      if (id.startsWith('status_')) {
        settings.updateRemoteSettings({ status: id.substring(7, id.length) });
      }
    });

    tray.setSystemTrayApplications(customTrayMenus);
  }

  pluginWillUnload () {
    uninject('tray-status-picker');
    tray.setSystemTrayApplications([]);
  }
};
