const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('unban a user')
    .addStringOption((option) => option.setName('user').setDescription("the user to unban").setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription("the reason for unbanning")),
	async execute(interaction) {
	  const user = interaction.options.getString('user');
    const reason = interaction.options.getString('reason');

    try {
      const bans = await interaction.guild.bans.fetch();
      const bannedUser = bans.find(ban => ban.user.id === user || ban.user.username === user);

      if (!bannedUser) {
        return interaction.reply({ content: `Could not find banned user: ${user}`, flags: MessageFlags.Ephemeral });
      }

      await interaction.guild.members.unban(bannedUser.user.id, reason || `Unbanned by ${interaction.user.tag}`);

      await interaction.reply(`User ${bannedUser.user.tag} was unbanned by ${interaction.user.tag}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error unbanning this user', flags: MessageFlags.Ephemeral });
    }
  }
};