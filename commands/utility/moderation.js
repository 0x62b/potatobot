const { SlashCommandBuilder, PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('moderation commands')
    .addStringOption((option) => option.setName('action').setDescription("name of setting to change").setRequired(true))
    .addUserOption((option) => option.setName('user').setDescription("the user to operate on").setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription("reason for punishment"))
    .addIntegerOption((option) => option.setName('mins').setDescription("the duration of punishment in mins"))
    .addIntegerOption((option) => option.setName('hours').setDescription("the duration of punishment in hours"))
    .addIntegerOption((option) => option.setName('days').setDescription("the duration of punishment in days"))
    .addIntegerOption((option) => option.setName('months').setDescription("the duration of punishment in months"))
    .addBooleanOption((option) => option.setName('permanent').setDescription("whether to punish permanently")),
	async execute(interaction) {
	  const action = interaction.options.getString('action');
	  const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const mins = interaction.options.getInteger('mins');
    const hours = interaction.options.getInteger('hours');
    const days = interaction.options.getInteger('days');
    const months = interaction.options.getInteger('months');
    const perm = interaction.options.getBoolean('permanent');

    const member = await interaction.guild.members.fetch(user.id);

    switch (action) {
      case "kick":
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
        break;
      case "ban":
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
          await interaction.reply({content: "You do not have perms to ban users", flags: MessageFlags.Ephemeral});
          return;
        }

        if (!member.bannable) {
          await interaction.reply({content: "cannot ban this member", flags: MessageFlags.Ephemeral});
          return;
        }

        await member.ban({ reason: reason || `Banned by ${interaction.user.tag}` });
        await interaction.reply(`User ${user.tag} was banned by ${interaction.user.tag}`);
        break;
      case "mute":
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
          await interaction.reply({content: "You do not have perms to mute users", flags: MessageFlags.Ephemeral});
          return;
        }

        if (!member.moderatable) {
          await interaction.reply({content: "cannot mute this member", flags: MessageFlags.Ephemeral});
          return;
        }

        let duration = 0;
        if (mins) duration += mins * 60 * 1000;
        if (hours) duration += hours * 60 * 60 * 1000;
        if (days) duration += days * 24 * 60 * 60 * 1000;
        if (months) duration += months * 30 * 24 * 60 * 60 * 1000;

        const maxDuration = 28 * 24 * 60 * 60 * 1000;
        if (perm || duration > maxDuration) duration = maxDuration;

        if (duration === 0) {
          await interaction.reply({content: "Please specify a duration for the mute", flags: MessageFlags.Ephemeral});
          return;
        }

        await member.timeout(duration, reason || `Muted by ${interaction.user.tag}`);
        await interaction.reply(`User ${user.tag} was muted by ${interaction.user.tag}`);
        break;
      default:
        await interaction.reply({content: "Not a valid action", flags: MessageFlags.Ephemeral});
    }
  }
};