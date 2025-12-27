const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const reminderScheduler = require('../../reminderScheduler');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('set reminders')
    .addStringOption((option) => option.setName('reminder').setDescription("name of reminder").setRequired(true))
    .addIntegerOption((option) => option.setName('mins').setDescription("mins to remind after"))
    .addIntegerOption((option) => option.setName('hours').setDescription("hours to remind after"))
    .addIntegerOption((option) => option.setName('days').setDescription("days to remind after"))
    .addIntegerOption((option) => option.setName('months').setDescription("months to remind after")),
  async execute(interaction) {
	  const reminder = interaction.options.getString('reminder');
	  const mins = interaction.options.getInteger('mins');
	  const hours = interaction.options.getInteger('hours');
	  const days = interaction.options.getInteger('days');
	  const months = interaction.options.getInteger('months');

    const json = JSON.parse(fs.readFileSync("settings.json"));
    if (!json || !json[interaction.guild.id] || !json[interaction.guild.id].reminders_channel) {
      await interaction.reply({
        content: "Your server does not have a reminders channel set. Ask a server admin to set the `reminders_channel` setting.",
        flags: MessageFlags.Ephemeral
      })
    }

    let duration = 0;
    if (mins) duration += mins * 60 * 1000;
    if (hours) duration += hours * 60 * 60 * 1000;
    if (days) duration += days * 24 * 60 * 60 * 1000;
    if (months) duration += months * 30 * 24 * 60 * 60 * 1000;

    reminderScheduler.add(interaction.user.id, interaction.guild.id, duration, reminder);

    await interaction.reply({
      content: `will remind ${reminder} in ${months || 0} months, ${days || 0} days, ${hours || 0} hours, ${mins || 0} mins`,
      flags: MessageFlags.Ephemeral
    });
  },
};