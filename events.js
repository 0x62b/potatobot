const fs = require('fs');
const { MessageFlags } = require('discord.js');

module.exports = {
	messageCreate: (message) => {
		const json = JSON.parse(fs.readFileSync("settings.json"));
		if (!json[message.guild.id]) return;

		const triggers = json[message.guild.id].triggers;
		if (!triggers) return;

		triggers.split(',').map((t) => {
			const trigger = t.split(':')[0];
			const msg = t.split(':')[1];
			if (message.content == trigger) message.reply(msg);
		});
	},
	guildMemberAdd: async (member) => {
		const json = JSON.parse(fs.readFileSync("settings.json"));

		if (json && json[member.guild.id] && json[member.guild.id]["spawn_channel"] && json[member.guild.id]["spawn_message"]) {
			const channel = await member.guild.channels.fetch(json[member.guild.id]["spawn_channel"]).catch(console.error);
			if (channel) {
				await channel.send(
					json[member.guild.id]["spawn_message"]
						.replace("[USER]", `<@${member.user.id}>`)
						.replace("[SERVER]", member.guild.name)
				);
			}
		}
	},
	interactionCreate: async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
};