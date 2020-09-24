require("dotenv").config();
const Discord = require("discord.js");
const shlex = require("shlex");
const fs = require("fs");
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

function log(str) {
	if (process.env.NO_LOG) return;
	else return console.log(str);
}
process.on("unhandledRejection", () => {});

const prefix = process.env.PREFIX || "mc";

const client = new Discord.Client();
client.commands = new Discord.Collection();
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
client
	.login(process.env.TOKEN)
	.then(() => {
		log("LOGIN");
	})
	.catch((e) => {
		log("LOGIN FAILED");
		log(e);
		process.exit(1);
	});

const guildData = require("guild-data")(client, { prefix: prefix });

client.on("ready", () => {
	log("READY");
});

client.on("message", (message) => {
	let user = message.author;
	let mention = false;
	let id = client.user.id;
	if (!message.guild) return;
	if (user.bot) return;
	const gld = guildData(message.guild.id);
	if (
		!message.content.startsWith(gld.prefix) &&
		!message.content.startsWith("<@!" + id + ">")
	)
		return;
	else if (message.content.startsWith("<@!" + id + ">")) mention = true;

	let commandBody;
	mention
		? (commandBody = message.content.slice(id.length + 4))
		: (commandBody = message.content.slice(gld.prefix.length));
	const args = shlex.split(commandBody);
	let command = args.shift();

	if (!command && mention) command = "help";
	else if (!command) return;

	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(client, message, args, gld);
	} catch (e) {
		console.log(e);
		message.reply("couldn't execute command: `" + e.message + "`!");
	}
});
