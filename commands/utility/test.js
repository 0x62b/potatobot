const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('test').setDescription('test command'),
	async execute(interaction) {
		await interaction.reply(`success, run by ${interaction.user.username} from ${interaction.guild.name}`);
	},
};