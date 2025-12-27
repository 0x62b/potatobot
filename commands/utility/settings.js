const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('set settings')
    .addStringOption((option) => option.setName('setting').setDescription("name of setting to change").setRequired(true))
    .addStringOption((option) => option.setName('value').setDescription("new value of the setting").setRequired(true)),
	async execute(interaction) {
	  const setting = interaction.options.getString('setting');
	  const value = interaction.options.getString('value');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      await interaction.reply("you do not have sufficient perms");
      return;
    }

    if (
      setting == "confessions_number" ||
      setting == "triggers"
    ) {
      await interaction.reply("this setting cannot be set from here");
      return;
    }

    if (!fs.existsSync("config/settings.json")) {
      fs.writeFileSync("config/settings.json", "{}");
    }

    const json = JSON.parse(fs.readFileSync("config/settings.json"));

    if (!json[interaction.guild.id]) {
      json[interaction.guild.id] = {};
    }

    json[interaction.guild.id][setting] = value;
    fs.writeFileSync("config/settings.json", JSON.stringify(json, null, 2));

		await interaction.reply(`success, setting ${setting} from ${interaction.guild.name} updated to ${value}`);
	},
};