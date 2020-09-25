const Discord = require("discord.js");
module.exports = {
	name: "server",
	description: "Get/set the default server for this guild.",
	usage: "server [host:port]",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} message
	 * @param {String[]} args
	 * @param {Object} gld
	 */
	execute(client, message, args, gld) {
		const member = message.guild.member(message.author);
		if (args[0] && member.hasPermission("MANAGE_GUILD")) {
			gld.server = args[0];
			message.channel.send(
				`Default server changed to '${args[0].replace(/@/g, "\\@")}'.`
			);
		} else {
			message.channel.send(
				`This guild's default server is ${
					gld.server
						? `'${gld.server.replace(/@/g, "\\@")}'`
						: `not set`
				}.`
			);
		}
	},
};
