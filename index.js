const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const Classes = require("./classes.js");



//const currentServer;

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log(client);

	//currentServer = new Server(client.)
});

let prefix = "!"; // currently global, update to table later

function randNum(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1) + min);
}

client.on("message", msg => {	
	let isGuild = msg.guild;

	if (isGuild) { // in a guild my man
		
	} else { // DMs

	}



	let messageContent = msg.content.toLowerCase();

	if (messageContent.startsWith(prefix + "rhyme ")) { // to-do: consider number starts & other non-alpha chars
		// to-do: scrape rhyme zone instead of just changing the first letter
		// to-do: create a class for these commands, set default parameters and stuff, make it easier to control/scale
		// to-do: consider case-support
		//let messageContent = msg.content;

		let msgAfterSpace = messageContent.indexOf(" ") + 1;

		messageContent = messageContent.substr(msgAfterSpace);

		msgAfterSpace = messageContent.indexOf(" ");

		if (msgAfterSpace > -1) {
			msg.reply("I only support single word rhymes!");
			return;
		}

		let diffChar = false;

		let randomChar;

		while (!diffChar) {
			// 97 to 122 lowercase a-z
			let randomASCII = randNum(97, 122);
			randomChar = String.fromCharCode(randomASCII);

			if (randomChar != messageContent.substr(0, 0)) {
				diffChar = true;
			} else {
				console.log("character double");
			}
		}

		messageContent = randomChar + messageContent.substr(1);

		msg.reply(messageContent);
	} else if (messageContent.startsWith(prefix + "reverse ")) {
		let messageContent = msg.content;

		let msgAfterSpace = messageContent.indexOf(" ");

		messageContent = messageContent.substr(msgAfterSpace);

		let reverseContent = messageContent.split("");
		reverseContent = reverseContent.reverse();
		reverseContent = reverseContent.join("");

		msg.reply(reverseContent);
	} else if (messageContent.startsWith(prefix + "should i ") || messageContent.startsWith(prefix + "should we ") || messageContent.startsWith(prefix + "should you ")) {
		let truthy = randNum(0, 1);

		if (truthy == 0) {
			msg.reply("no");
		} else {
			msg.reply("yes");
		}
	}
});

client.login(config.token);