require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');
const banScheduler = require('./schedulers/banScheduler');
const reminderScheduler = require('./schedulers/reminderScheduler');
const { messageCreate, guildMemberAdd, interactionCreate } = require('./events');
const { loadCommands } = require('./util');

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
	messageCreate(message);
});

client.on(Events.GuildMemberAdd, async (member) => {
	guildMemberAdd(member);
});

client.on(Events.InteractionCreate, async (interaction) => {
	interactionCreate(interaction);
});

client.once(Events.ClientReady, () => {
	banScheduler.init(client);
	reminderScheduler.init(client);
});

loadCommands(client);

client.login(token);