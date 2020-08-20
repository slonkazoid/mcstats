console.log("Started");
const Discord = require("discord.js");
const mc = require("minecraft-protocol");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("servers.db");
db.run(`CREATE TABLE IF NOT EXISTS \`servers\` (
	\`DISCORD\` TEXT NOT NULL,
	\`IP\` TEXT NOT NULL,
	\`PORT\` TEXT DEFAULT '25565'
);`);

const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

const prefix = "+";

client.on("ready", () => console.log("Bot Ready"));

client.on("message", function (msg) {
	if (!msg.guild) return;
	if (msg.author.bot) return;
	if (!msg.content.startsWith(prefix)) return;

	const serverID = msg.guild.id;

	const commandBody = msg.content.slice(prefix.length);
	const args = commandBody.split(" ");
	const command = args.shift().toLowerCase();

	switch (command) {
		case "help":
			msg.channel.send(`\`\`\`
${prefix}help     Sends this
${prefix}invite   Sends an invite link for the bot
${prefix}server   Sets the default Minecraft server for this Discord server
${prefix}motd     Displays the server's Message Of The Day
${prefix}ping     Displays the latency to the server
${prefix}players  Displays how many players are online (lists them if it can)
\`\`\``);
			break;
		case "invite":
			msg.channel.send(
				"https://discord.com/api/oauth2/authorize?client_id=740191553238335560&permissions=2048&redirect_uri=https%3A%2F%2Fmcstats.ml&scope=bot"
			);
			break;
		case "server":
			if (args.length == 0) {
				db.get("SELECT * FROM `servers` WHERE `DISCORD` = ?", serverID, function (err, res) {
					if (err) msg.channel.send("There was an error with the query.");
					else if (!res) msg.channel.send("No default server found.");
					else
						msg.channel.send(
							"The default MC server for " +
								msg.guild.name +
								" is `" +
								res.IP +
								(res.PORT !== "25565" ? ":" + res.PORT : "") +
								"`."
						);
				});
			} else if (args.length >= 1) {
				let member = msg.guild.member(msg.author);
				if (member.hasPermission("MANAGE_GUILD")) {
					db.get("SELECT * FROM `servers` WHERE `DISCORD` = ?", serverID, function (err, res) {
						if (err) msg.channel.send("There was an error with the query.");
						else {
							let port;
							if ((args.length >= 2 && parseInt(args[1])) || false) port = args[1];
							else port = "25565";
							let SQL;
							if (!res) {
								SQL = db.prepare("INSERT INTO `servers` (DISCORD, IP, PORT) VALUES ($id, $ip, $port)");
							} else {
								SQL = db.prepare("UPDATE `servers` SET IP = $ip, PORT = $port WHERE DISCORD = $id");
							}
							SQL.run({ $id: serverID, $ip: args[0], $port: port }, function (err) {
								if (err) msg.channel.send("There was an error with the query.");
								else msg.channel.send("Server updated.");
							});
						}
					});
				} else {
					msg.channel.send("You can't do this.");
				}
			}
			break;
		default:
			const handle = (err, server) => {
				if (err) {
					msg.channel.send("The server is offline.");
				} else if (command === "motd") {
					if (typeof server.description !== "string") {
						msg.channel.send("```\n" + server.description.extra.map((a) => a.text).join("\n") + "\n```");
					} else {
						msg.channel.send("```\n" + server.description.replace(/§[a-zA-Z0-9]/g, "") + "\n```");
					}
				} else if (command === "ping") {
					msg.channel.send("Latency: " + server.latency + "ms");
				} else if (command === "players") {
					msg.channel.send(
						`There are ${server.players.online}/${server.players.max} people online.${
							server.players.sample && server.players.sample.length > 0
								? "\nCurrent players:\n```\n" + server.players.sample.map((a) => a.name).join("\n") + "\n```"
								: ""
						}`
					);
				} else if (command === "icon") {
					msg.channel.send(new Discord.MessageAttachment("data:image/gif;base64," + server.favicon));
				}
			};

			let ip,
				port = "25565";
			if (args.length !== 0) {
				ip = args[0];
				if (args.length >= 2) port = args[1];
				mc.ping({ host: ip, port: port }, handle);
			} else {
				db.get("SELECT * FROM `servers` WHERE `DISCORD` = ?", serverID, function (err, res) {
					if (err) msg.channel.send("There was an error with the query.");
					else if (!res) msg.channel.send("Please specify a server or set a default one.");
					else {
						ip = res.IP;
						port = res.PORT;
						mc.ping({ host: ip, port: port }, handle);
					}
				});
			}
			break;
	}
});
