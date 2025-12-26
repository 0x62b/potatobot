require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const banScheduler = require('./banScheduler');

const token = process.env.BOT_TOKEN;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ]
});

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('messageCreate', (message) => {
  const json = JSON.parse(fs.readFileSync("settings.json"));
  if (!json[message.guild.id]) return;

  const triggers = json[message.guild.id].triggers;
  if (!triggers) return;
	
  triggers.split(',').map((t) => {
    const trigger = t.split(':')[0];
    const msg = t.split(':')[1];
    if (message.content == trigger) message.reply(msg);
  });
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const folders = fs.readdirSync(foldersPath);

for (const folder of folders) {
	const commandsPath = path.join(foldersPath, folder);
	const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

	for (const file of files) {
		const filename = path.join(commandsPath, file);
		const command = require(filename);
		
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`error: command ${filename} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once('ready', () => {
	banScheduler.init(client);
});

client.on(Events.GuildMemberAdd, async (member) => {
	const json = JSON.parse(fs.readFileSync("settings.json"));

	if (json && json[member.guild.id] && json[member.guild.id]["spawn_channel"] && json[member.guild.id]["spawn_message"]) {
		const channel = await member.guild.channels.fetch(json[member.guild.id]["spawn_channel"]).catch(console.error);
		if (channel) {
			await channel.send(json[member.guild.id]["spawn_message"].replace("[USER]", member.user.tag));
		}
	}
});

client.on(Events.InteractionCreate, async (interaction) => {
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
});

client.login(token);