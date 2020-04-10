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
	constructor(commands, authority, properties = [], activateFunc) {
		this.commands = commands; // the commands capable of activating functions
		this.authority = authority; // the access level required to call its function (0 = everyone, 1 = specific role, 2 = administrator), this is not currently implemented
		this.activate = activateFunc;

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

	activate(msg) {
		if (this.authority == 0) {
			activateFunc(msg);
		}
	}
}

// functions

function randNum(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1) + min);
}

// commands

// potential to-do: pass the "activate" function as a parameter (anon func) when creating new objects
// only problem is potentially w/ arguments and "this" keyword
// not necessary at this stage, i think

let reverse = new Command(["reverse", "re"], 0, [], function(msg) {
	let messageContent = this.strip(msg);

	let reverseContent = messageContent.split("");
	reverseContent = reverseContent.reverse();
	reverseContent = reverseContent.join("");

	msg.reply(reverseContent);
}); // potential to-do: convert authority level to an enum-type object

/*reverse.activate = function(msg) { // above comments worth consideration, every single command will have this function
	let messageContent = this.strip(msg);

	let reverseContent = messageContent.split("");
	reverseContent = reverseContent.reverse();
	reverseContent = reverseContent.join("");

	msg.reply(reverseContent);
}*/

const https = require("https");
const cheerio = require("cheerio");

let rhyme = new Command(["rhyme", "rh"], 0, [], function(msg) {
	let messageContent = this.strip(msg);

	if (messageContent.lastIndexOf(" ") > -1) {
		messageContent = messageContent.substr(messageContent.lastIndexOf(" ") + 1);
	}

	const options = {
		hostname: "rhymezone.com",
		port: 443,
		path: `/r/rhyme.cgi?Word=${messageContent}&typeofrhyme=perfect&org1=syl&org2=l&org3=y`,
		method: "GET"
	}

	msg.channel.startTyping();

	const req = https.request(options, async function(res) {
		console.log(`statusCode: ${res.statusCode}`);

		let rhymes = [];

		let rhymePromises = [];

		let rhymeParentPromise = new Promise((parentResolve, parentReject) => {
			res.on("data", async function (d) {
				let rhymePromise = new Promise((resolve, reject) => {
					const $ = cheerio.load(d);

					console.log("SGFKJDSFGKSJDFGKLJDSFLKGJFDSKLGJFSDLKGFDSJLGK");
					console.log($.html($(".r")));

					const htmlData = $.html($(".r")); // get elements with class "r"

					let reg = /(d=[^-][a-zA-Z_-]+)/g;
					let result;

					/*
						Using variables and setting the "lastNode" in this loop at the end while
						beforehand checking it against the "firstNode" that I set at the beginning
						of the loop, I can find a way to check if the lastNode is larger/more syllables
						than the firstNode of the next loop's iteration (mainly for when data is called
						again). This way, I can prevent "almost rhymes" from being displayed.
						There are also other ways to do this, but it is not yet implemented.
						I also may consider displaying them if no "perfect" rhymes are displayed.
					*/

					while ((result = reg.exec(htmlData)) !== null) {
						rhymes.push(result[0].substr(2));
					}

					resolve(rhymes);
				});

				let re = await rhymePromise;

				rhymePromise.then(function(rhymeArray) {
					rhymePromises.push(rhymePromise);
				}).catch(reason => {
					console.log("rejected promise: " + reason);
				});
			});

			let rhymePromiseLength = rhymePromises.length;
			let currRhymePromiseLength = rhymePromiseLength;

			setTimeout(() => {
				console.log("dfklsdfsdf")
				do {
					currRhymePromiseLength = rhymePromiseLength;
					setTimeout(() => console.log("testdfsdfdsf"), 0);
					console.log("this happened");
				} while (currRhymePromiseLength < rhymePromiseLength)

				parentResolve();
			}, 200);
		});

		rhymePromises.push(rhymeParentPromise);

		let re2 = await rhymeParentPromise;

		console.log("awaited2");

		Promise.all(rhymePromises).then(values => {
			let rhymeChoiceNum = randNum(0, rhymes.length);
			console.log(rhymeChoiceNum);
			let rhymeChoice = rhymes[rhymeChoiceNum]; // to-do: add check to see if rhyme exists & if there are results
			console.log(rhymeChoice);

			let quickMatch = /[_]+/g;

			rhymeChoice = rhymeChoice.replace(quickMatch, " ");

			if (rhymeChoice.length > 0) {
				msg.reply(rhymeChoice);
			} else {
				msg.reply("I can't rhyme that, man.");
			}

			msg.channel.stopTyping();
		}).catch(err => {
			console.log("rhyme promise parent error: " + err);
		});


	});

	req.on("error", error => {
		console.error(error);
	});

	req.end();
});

let should = new Command(["should i", "should you", "should we"], 0, [], function(msg) {
	let truthy = randNum(0, 1);

	if (truthy == 0) {
		msg.reply("no");
	} else {
		msg.reply("yes");
	}
});

/*
User inputs a message, bot notices there is a message,
compares it to check if it's a command, if it is a
command, the command's function is activated

Commands: a new command object created holds the names
that activate a command and the authority level necessary
*/