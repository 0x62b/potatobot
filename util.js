const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = {
  loadCommands: (client) => {
    client.commands = new Collection();

    const foldersPath = path.join(__dirname, 'commands');
    const folders = fs.readdirSync(foldersPath);

    for (const folder of folders) {
      const commandsPath = path.join(foldersPath, folder);
      const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

      for (const file of files) {
        const filename = path.join(commandsPath, file);
        const command = require(filename);
        
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
        } else {
          console.log(`error: command ${filename} is missing a required "data" or "execute" property.`);
        }
      }
    }
  }
}