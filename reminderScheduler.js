const fs = require('fs');
const path = require('path');

const filename = path.join(__dirname, 'config', 'scheduled_reminders.json');

function load() {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, "[]");
    console.log('write schduled reminders file');
  }
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function save(reminders) {
  fs.writeFileSync(filename, JSON.stringify(reminders, null, 2));
}

module.exports = {
  add: (userId, guildId, duration, content) => {
    const reminders = load();
    reminders.push({
      userId,
      guildId,
      content,
      remindAt: Date.now() + duration
    });
    save(reminders);
  },

  init: (client) => {
    async function reminders() {
      const reminders = load();
      const now = Date.now();
      const remain = [];

      for (const reminder of reminders) {
        if (reminder.remindAt <= now) {
          const json = JSON.parse(fs.readFileSync("config/settings.json"));
          if (!json || !json[reminder.guildId] || !json[reminder.guildId].reminders_channel) return; // fail silently
          
          try {
            const channel = await client.channels.fetch(json[reminder.guildId].reminders_channel);
            await channel.send(`<@${reminder.userId}>: reminder: ${reminder.content}`);
          } catch (e) {
            remain.push(reminder); // try again later
          }
        } else {
          remain.push(reminder);
        }
      }

      if (remain.length !== reminders.length) {
        save(remain);
      }
    }

    setInterval(reminders, 5000);
    reminders();
  }
};
