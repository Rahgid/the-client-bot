const Discord = require("discord.js");
const client = new Discord.Client();

const fs = require("fs");

let config = fs.readFileSync("config.json", {
		encoding: "utf-8",
		flag: "r+"
});

config = JSON.parse(config);

const Classes = require("./classes.js");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log(client);
});

let prefix = "!"; // json support implemented, only here for legacy w/ old functions until new commands implemented

function randNum(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1) + min);
}

client.on("message", msg => {
	let isGuild = msg.guild;

	if (isGuild) { // in a guild my man
		let commandArr = global.commandArray;
		console.log(commandArr);
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