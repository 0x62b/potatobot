const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const banScheduler = require('../../banScheduler');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('kick users (this does not ban them)')
    .addUserOption((option) => option.setName('user').setDescription("the user to kick").setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription("reason for kick")),
	async execute(interaction) {
	  const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const member = await interaction.guild.members.fetch(user.id);

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      await interaction.reply({content: "You do not have permissions to kick users!", flags: MessageFlags.Ephemeral});
      return;
    }

    if (!member.kickable) {
      await interaction.reply({content: "cannot kick this member", flags: MessageFlags.Ephemeral});
      return;
    }
    
    await member.kick(reason || `Kicked by ${interaction.user.tag}`);
    await interaction.reply(`User ${user.tag} was kicked by ${interaction.user.tag}`);
  }
};