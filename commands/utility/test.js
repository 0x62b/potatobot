const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('test').setDescription('test command'),
	async execute(interaction) {
		await interaction.reply(`success, run by user: ${interaction.user.username} from server: ${interaction.guild.name}`);
	},
};