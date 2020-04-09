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

class Command {
	constructor(commands, authority, properties = []) {
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

	strip(messageObject, type = 0) { // default type is normal strip, returns string; type 1 returns bool if only one argument or not
		let messageContent = messageObject.content;

		let msgAfterSpace = messageContent.indexOf(" ") + 1;

		messageContent = messageContent.substr(msgAfterSpace);

		switch(type) {
			case 0:
				return messageContent;
				break;
			case 1: // i could make this default but i'm going to leave it in case i implement more cases later
				msgAfterSpace = messageContent.indexOf(" ");
				if (msgAfterSpace > -1) { // "Is there only one argument?" "No"
					return false;
				}

				return true; // "Yes, there is only one argument"
				break;
			default: // to-do set up error object class and return it to my functions
				return {};
		}
	}
}

// commands

// potential to-do: pass the "activate" function as a parameter (anon func) when creating new objects
// only problem is potentially w/ arguments and "this" keyword
// not necessary at this stage, i think

let reverse = new Command(["reverse", "r"], 0); // potential to-do: convert authority level to an enum-type object

reverse.activate = function(msg) { // above comments worth consideration, every single command will have this function
	let messageContent = this.strip(msg);

	let reverseContent = messageContent.split("");
	reverseContent = reverseContent.reverse();
	reverseContent = reverseContent.join("");

	msg.reply(reverseContent);
}

/*
User inputs a message, bot notices there is a message,
compares it to check if it's a command, if it is a
command, the command's function is activated

Commands: a new command object created holds the names
that activate a command and the authority level necessary
*/