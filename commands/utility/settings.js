const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
//todo: prevent confessions,triggers vals from being changed here

module.exports = {
	data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('set settings')
    .addStringOption((option) => option.setName('setting').setDescription("name of setting to change").setRequired(true))
    .addStringOption((option) => option.setName('value').setDescription("new value of the setting").setRequired(true)),
	async execute(interaction) {
	  const setting = interaction.options.getString('setting');
	  const value = interaction.options.getString('value');

    if (
      setting == "confessions_number" ||
      setting == "triggers"
    ) {
      await interaction.reply("this setting cannot be set from here");
      return;
    }

    if (!fs.existsSync("settings.json")) {
      fs.writeFileSync("settings.json", "{}");
    }

    const json = JSON.parse(fs.readFileSync("settings.json"));

    if (!json[interaction.guild.id]) {
      json[interaction.guild.id] = {};
    }

    json[interaction.guild.id][setting] = value;
    fs.writeFileSync("settings.json", JSON.stringify(json, null, 2));

		await interaction.reply(`success, setting ${setting} from ${interaction.guild.name} updated to ${value}`);
	},
};