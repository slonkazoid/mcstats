const Discord = require("discord.js");
module.exports = {
	name: "prefix",
	description: "Get/set the prefix for this guild.",
	usage: "prefix [new]",
	aliases: [],
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} message
	 * @param {String[]} args
	 * @param {Object} gld
	 */
	execute(client, message, args, gld) {
		if (args[0] && message.member.hasPermission("MANAGE_GUILD")) {
			gld.prefix = args[0];
			message.channel.send(
				`Prefix changed to '${args[0].replace(/@/g, "\\@")}'.`
			);
		} else {
			message.channel.send(
				`This guild's prefix is '${gld.prefix.replace(/@/g, "\\@")}'.`
			);
		}
	},
};
