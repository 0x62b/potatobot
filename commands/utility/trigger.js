const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

function parseTriggers(triggers) {
  if (!triggers) return [];
  const out = [];
  triggers.split(',').map((t) => {
    const trigger = t.split(':')[0];
    const msg = t.split(':')[1];
    out.push({"trigger": trigger, "message": msg});
  });
  return out;
}

function genTriggers(triggers) {
  return triggers.map(t => `${t.trigger}:${t.message}`).join(',');
}

module.exports = {
	data: new SlashCommandBuilder()
    .setName('trigger')
    .setDescription('command relating to triggers')
    .addStringOption((option) => option.setName('action').setDescription("action: [add, remove, list]").setRequired(true))
    .addStringOption((option) => option.setName('name').setDescription("name of the trigger"))
    .addStringOption((option) => option.setName('response').setDescription("how to respond when triggered")),
	async execute(interaction) {
	  const action = interaction.options.getString('action');
	  const name = interaction.options.getString('name');
    const response = interaction.options.getString('response');

    let ret = "";

    if (!fs.existsSync("settings.json")) {
      fs.writeFileSync("settings.json", "{}");
    }

    const json = JSON.parse(fs.readFileSync("settings.json"));

    if (!json[interaction.guild.id]) {
      json[interaction.guild.id] = {};
    }

    const triggers = parseTriggers(json[interaction.guild.id].triggers || "");

    switch (action) {
      case "list":
        if (!json[interaction.guild.id].triggers) {
          ret = "No triggers set.";
          break;
        }

        triggers.map((trigger) => {
          ret += `${trigger.trigger}: ${trigger.message}\n`
        });
        break;
      case "add":
        if (!name || !response) {
          ret = "missing name or response";
          break;
        }
        triggers.push({ trigger: name, message: response });
        json[interaction.guild.id].triggers = genTriggers(triggers);
        fs.writeFileSync("settings.json", JSON.stringify(json, null, 2));
        ret = "success";
        break;
      case "remove":
        const len = triggers.length;
        const filtered = triggers.filter(t => t.trigger !== name);

        if (filtered.length < len) {
          json[interaction.guild.id].triggers = genTriggers(filtered);
          fs.writeFileSync("settings.json", JSON.stringify(json, null, 2));
          ret = "success";
        } else {
          ret = "trigger does not exist";
        }
        break;
    }

		await interaction.reply(ret);
	},
};