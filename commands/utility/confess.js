const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('confess something anonymously')
    .addStringOption((option) => option.setName('confession').setDescription("your confession").setRequired(true)),
  async execute(interaction) {
	  const confession = interaction.options.getString('confession');

    if (!fs.existsSync("settings.json")) {
      await interaction.reply({
				content: "settings.json does not exist. Please generate it by running /settings confessions_channel <ID OF CONFESSIONS CHANNEL>",
				flags: MessageFlags.Ephemeral,
			});
      return;
    }

    const json = JSON.parse(fs.readFileSync("settings.json"));

    if (!json[interaction.guild.id]) {
      await interaction.reply({
				content: "This guild does not have a bot settings entry yet. Please generate it by running /settings confessions_channel <ID OF CONFESSIONS CHANNEL>",
				flags: MessageFlags.Ephemeral,
			});
      return;
    }

    const channel = json[interaction.guild.id].confessions_channel;

    if (!channel) {
      await interaction.reply({
				content: "This guild does not have a confessions channel set yet. Please generate it by running /settings confessions_channel <ID OF CONFESSIONS CHANNEL>",
				flags: MessageFlags.Ephemeral,
			});
      return;
    }

    const number = (json[interaction.guild.id].confessions_number || 0) + 1;
    
    if (!number) {
      json[interaction.guild.id].confessions_number = "1";
      number = "1";
    }

    interaction.client.channels.cache.get(channel).send(`Confession #${number}: ${confession}`);

    json[interaction.guild.id].confessions_number = number;
    fs.writeFileSync("settings.json", JSON.stringify(json, null, 2));

		await interaction.reply({ content: `success, your confession was sent as #${number}`, flags: MessageFlags.Ephemeral });
  },
};