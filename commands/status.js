const Discord = require("discord.js");
const mc = require("minecraft-protocol");

module.exports = {
	name: "status",
	description: "Display the status of the specified server or the default one.",
	usage: "status [ip:port]",
	aliases: ["stats"],
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} message
	 * @param {String[]} args
	 * @param {Object} gld
	 */
	execute(client, message, args, gld) {
		let spec = args[0] || gld.server;
		if (spec) {
			let hostPort = spec.split(":");
			let host = hostPort[0];
			let port = hostPort[1];
			message.reply("pinging...").then((msg) => {
				mc.ping({ host: host, port: port }, (err, res) => {
					if (err) {
						const embed = new Discord.MessageEmbed()
							.setFooter(
								`Requested by ${message.author.tag}`,
								message.author.avatarURL()
							)
							.setColor("RED")
							.setTitle("Error")
							.setDescription("Got error while pinging `" + spec + "`.")
							.addField("Details", err.message);
						msg.edit(embed);
					} else {
						const type = !res.maxPlayers;
						delete res.favicon;
						const embed = new Discord.MessageEmbed()
							.setFooter(
								`Requested by ${message.author.tag}`,
								message.author.avatarURL()
							)
							.setColor("GREEN")
							.setTitle("Results")
							.setDescription("Ping results for `" + spec + "`")
							.addField(
								"MOTD",
								(type
									? typeof res.description === "object"
										? res.description.extra
											? (res.description.text || "") +
											  res.description.extra.map((x) => x.text).join("")
											: res.description.text
										: res.description
									: res.motd) || "A Minecraft Server"
							)
							.addField(
								"Player Count",
								`${type ? res.players.online : res.playerCount}/${
									type ? res.players.max : res.maxPlayers
								}`
							)
							.addField(
								"Players",
								(type
									? (res.players.sample || []).map((x) => x.name).join("\n")
									: false) || "Can't list players or server empty."
							)
							.addField(
								"Latency",
								(type ? res.latency + "ms" : false) ||
									"Can't get latency information."
							)
							.addField("Version", type ? res.version.name : res.version);
						msg.edit("", embed);
					}
				});
			});
		} else {
			message.reply("no server specified and no default server found.");
		}
	},
};
