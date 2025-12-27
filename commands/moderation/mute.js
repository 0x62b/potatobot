const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('mute a user')
    .addUserOption((option) => option.setName('user').setDescription("the user to mute").setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription("reason for mute"))
    .addIntegerOption((option) => option.setName('mins').setDescription("the duration of mute in mins"))
    .addIntegerOption((option) => option.setName('hours').setDescription("the duration of mute in hours"))
    .addIntegerOption((option) => option.setName('days').setDescription("the duration of mute in days")),
	async execute(interaction) {
	  const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const mins = interaction.options.getInteger('mins');
    const hours = interaction.options.getInteger('hours');
    const days = interaction.options.getInteger('days');

    const member = await interaction.guild.members.fetch(user.id);

    let duration = 0;
    if (mins) duration += mins * 60 * 1000;
    if (hours) duration += hours * 60 * 60 * 1000;
    if (days) duration += days * 24 * 60 * 60 * 1000;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await interaction.reply({content: "You do not have perms to mute users", flags: MessageFlags.Ephemeral});
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({content: "cannot mute this member", flags: MessageFlags.Ephemeral});
      return;
    }

    const maxDuration = 28 * 24 * 60 * 60 * 1000;
    let timeoutDuration = duration;
    if (perm || timeoutDuration > maxDuration) timeoutDuration = maxDuration; //max mute length 28 days

    if (timeoutDuration === 0) {
      await interaction.reply({content: "Please specify a duration for the mute", flags: MessageFlags.Ephemeral});
      return;
    }

    await member.timeout(timeoutDuration, reason || `Muted by ${interaction.user.tag}`);
    await interaction.reply(`User ${user.tag} was muted by ${interaction.user.tag}`);
  }
};