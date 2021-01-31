const { Plugin } = require('powercord/entities');

const { ipcRenderer } = require('electron');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const tray = getModule([ 'setSystemTrayApplications' ], false);

module.exports = class TrayStatusPicker extends (
  Plugin
) {
  async startPlugin () {
    const settings = await getModule([ 'updateRemoteSettings' ]);

    const customTrayMenus = [
      {
        name: 'Online',
        id: 'status_online'
      },
      {
        name: 'Idle',
        id: 'status_idle'
      },
      {
        name: 'Do not Disturb',
        id: 'status_dnd'
      },
      {
        name: 'Invisible',
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
