const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('confess something anonymously')
    .addStringOption((option) => option.setName('confession').setDescription("your confession").setRequired(true)),
  async execute(interaction) {
	  const confession = interaction.options.getString('confession');
    interaction.client.channels.cache.get(process.env.CONFESSIONS_CHANNEL).send(confession);
		await interaction.reply({ content: "success", flags: MessageFlags.Ephemeral });
  },
};