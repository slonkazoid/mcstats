const Discord = require("discord.js");
module.exports = {
	name: "invite",
	description: "Get an invite link for the bot.",
	usage: "invite",
	aliases: [],
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} message
	 * @param {String[]} args
	 * @param {Object} gld
	 */
	execute(client, message, args, gld) {
		message.channel.send(
			process.env.INVITE ||
				"https://discord.com/api/oauth2/authorize?client_id=740191553238335560&permissions=18432&scope=bot"
		);
	},
};
