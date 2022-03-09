global.Discord = require("discord.js");
const client = new global.Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_TYPING"]});

const fs = require("fs");

let config = fs.readFileSync("config.json", {
		encoding: "utf-8",
		flag: "r+"
});

config = JSON.parse(config);

const Classes = require("./classes.js");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	//console.log(client);
});

function randNum(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1) + min);
}

client.on("message", msg => {
	let isGuild = msg.guild;

	console.log("got message");

	if (isGuild) { // in a guild my man
		let commandArr = global.commandArray;
		//console.log(commandArr);
		for (const command of commandArr) {
			if (command.check(msg.guild.id, msg)) {
				command.activate(msg);
				break; // it found the command, don't keep looking
			}
		}
	} else { // DMs

	}
});

client.login(config.token);