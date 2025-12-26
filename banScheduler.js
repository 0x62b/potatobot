const fs = require('fs');
const path = require('path');

const filename = path.join(__dirname, 'scheduled_bans.json');

function load() {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, "[]");
    console.log('write schduled bans file');
  }
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function save(bans) {
  fs.writeFileSync(filename, JSON.stringify(bans, null, 2));
}

module.exports = {
  add: (userId, guildId, duration) => {
    const bans = load();
    bans.push({
      userId,
      guildId,
      unbanAt: Date.now() + duration
    });
    save(bans);
  },

  init: (client) => {
    async function unbans() {
      const bans = load();
      const now = Date.now();
      const remain = [];

      for (const ban of bans) {
        if (ban.unbanAt <= now) {
          try {
            const guild = await client.guilds.fetch(ban.guildId);
            await guild.members.unban(ban.userId, 'Temp ban ended');
            console.log(`unban ${ban.userId}`);
          } catch (error) {
            console.error(`Failed to unban ${ban.userId}:`, error);
            remain.push(ban);
          }
        } else {
          remain.push(ban);
        }
      }

      if (remain.length !== bans.length) {
        save(remain);
      }
    }
    setInterval(unbans, 60000); // 1minute
    unbans();
  }
};
