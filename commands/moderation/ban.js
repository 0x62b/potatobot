const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const banScheduler = require('../../schedulers/banScheduler');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('ban a user')
    .addUserOption((option) => option.setName('user').setDescription("the user to ban").setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription("reason for ban"))
    .addIntegerOption((option) => option.setName('mins').setDescription("the duration of ban in mins"))
    .addIntegerOption((option) => option.setName('hours').setDescription("the duration of ban in hours"))
    .addIntegerOption((option) => option.setName('days').setDescription("the duration of ban in days"))
    .addIntegerOption((option) => option.setName('months').setDescription("the duration of ban in months"))
    .addBooleanOption((option) => option.setName('permanent').setDescription("whether to ban permanently")),
	async execute(interaction) {
	  const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || `banned by ${interaction.user.id}`;
    const mins = interaction.options.getInteger('mins');
    const hours = interaction.options.getInteger('hours');
    const days = interaction.options.getInteger('days');
    const months = interaction.options.getInteger('months');
    const perm = interaction.options.getBoolean('permanent');

    const member = await interaction.guild.members.fetch(user.id);

    let duration = 0;
    if (mins) duration += mins * 60 * 1000;
    if (hours) duration += hours * 60 * 60 * 1000;
    if (days) duration += days * 24 * 60 * 60 * 1000;
    if (months) duration += months * 30 * 24 * 60 * 60 * 1000;

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.reply({content: "You do not have perms to ban users", flags: MessageFlags.Ephemeral});
      return;
    }


    if (!member.bannable) {
      await interaction.reply({content: "cannot ban this member", flags: MessageFlags.Ephemeral});
      return;
    }

    await member.ban({ reason: reason || `Banned by ${interaction.user.tag}` });

    if (duration > 0 && !perm) {
      banScheduler.add(user.id, interaction.guild.id, duration);
      await interaction.reply(`User ${user.tag} was banned by ${interaction.user.tag} for ${duration / 60000} minutes`);
    } else {
      await interaction.reply(`User ${user.tag} was banned by ${interaction.user.tag}`);
    }
  }
};