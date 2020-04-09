class Server {
	constructor(serverId) {
		this.serverId = serverId; // which server dis, supplied by some property of discord.js ima have to look up
		this.prefix = "!"; // default command prefix
	}
}

class Command {// extends Server {
	constructor(commands, authority) {
		//super();
		this.commands = commands; // the commands capable of activating functions
		this.authority = authority; // the access level required to call its function (0 = everyone, 1 = specific role, 2 = administrator), this is not currently implemented
	}

	check() {
		let commandValues = Object.values(this.commands);

		for (const command of commandValues) {

		}
	}
}

/*
User inputs a message, bot notices there is a message,
compares it to check if it's a command, if it is a
command, the command's function is activated

Commands: a new command object created holds the names
that activate a command and the authority level necessary
*/