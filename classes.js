/*class Server {
	constructor(serverId) {
		this.serverId = serverId; // which server dis, supplied by some property of discord.js ima have to look up
		this.prefix = "!"; // default command prefix
	}
}*/

const fs = require("fs");

let config = fs.readFileSync("config.json", {
		encoding: "utf-8",
		flag: "r+"
});

config = JSON.parse(config);

global.commandArray = [];

class Command {// extends Server {
	constructor(commands, authority, server, properties = []) {
		//super();
		this.commands = commands; // the commands capable of activating functions
		this.authority = authority; // the access level required to call its function (0 = everyone, 1 = specific role, 2 = administrator), this is not currently implemented
	
		commandArray.push(this);
	}

	check(serverId, messageObject) {
		const serverConfig = config.servers; // get list of servers

		let prefix;

		for (const server of serverConfig) {
			if (server.serverId == serverId) {
				prefix = server.prefix;
			}
		}

		prefix = prefix || serverConfig[0].prefix;

		let messageContent = messageObject.content;

		messageContent = messageContent.toLowerCase();

		for (const command of this.commands) { // to-do: rework this for spaces to be optional based off which command
			if (messageContent.startsWith(prefix + command + " ")) { // the space ensures the command has arguments
				return true;
			}
		}

		return false;
	}
}

// commands
let test = new Command(["test", "test2"], 0, 0);

test.activate = function(msg) {
	msg.reply("test");
}

let test3 = new Command(["test1", "test3"], 0, 0);

console.log("HEREERERERERERERRERE");

for (const com of commandArray) {
	console.log(com);

	let msg = {"content": "!test h"};

	console.log(com.check(0, msg));
}

/*
User inputs a message, bot notices there is a message,
compares it to check if it's a command, if it is a
command, the command's function is activated

Commands: a new command object created holds the names
that activate a command and the authority level necessary
*/