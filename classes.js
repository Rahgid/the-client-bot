const fs = require("fs");

let config = fs.readFileSync("config.json", {
		encoding: "utf-8",
		flag: "r+"
});

config = JSON.parse(config);

global.commandArray = [];

class Command {
	constructor(commands, authority, properties = {}, activateFunc) {
		this.commands = commands; // the commands capable of activating functions
		this.authority = authority; // the access level required to call its function (0 = everyone, 1 = specific role, 2 = administrator), this is not currently implemented
		this.activateFunc = activateFunc;
		this.properties = properties;

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

		for (const command of this.commands) {
			let commandCheck = command;

			if (!this.properties.noPrefix) {
				commandCheck = prefix + command;
			} /*else {
				commandCheck = " " + command;
			}*/

			if (this.properties.doesNotRequireSpace) {
				if (messageContent.startsWith(commandCheck)) {
					return true;
				}
			}

			if (messageContent.startsWith(commandCheck + " ")) { // the space ensures the command has arguments
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

	activate(msg) { // probably will change these ifs to a switch later
		console.log("here");
		if (this.authority == 0) {
			console.log("authority 0");
			this.activateFunc(msg);
		} else if (this.authority == 2) {
			console.log("authority 2");
			if (msg.member) {
				let member = msg.member;

				if (member.permissions.has("ADMINISTRATOR")) {
					console.log("here");
					console.log(member.permissions);
					console.log(member.permissions.has("ADMINISTRATOR"));
					this.activateFunc(msg);
				} else {
					msg.reply("You have to be an administrator to use this command!");
				}
			}
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

let reverse = new Command(["reverse", "re"], 0, {}, function(msg) {
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

let rhyme = new Command(["rhyme", "rh"], 0, {}, function(msg) {
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

	msg.channel.sendTyping();

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

		}).catch(err => {
			console.log("rhyme promise parent error: " + err);
		});


	});

	req.on("error", error => {
		console.error(error);
	});

	req.end();
});

let should = new Command(["should i", "should you", "should we"], 0, {}, function(msg) {
	let truthy = randNum(0, 1);

	if (truthy == 0) {
		msg.reply("no");
	} else {
		msg.reply("yes");
	}
});

let poker = new Command(["poker", "po"], 0, {"doesNotRequireSpace": true}, function(msg) {
	let pokerOptions = [
		"fold",
		"check",
		"all in",
		"raise",
		"call"
	];

	let randChoice = randNum(0, pokerOptions.length);

	msg.reply(pokerOptions[randChoice]);
});

let prefix = new Command(["prefix", "p"], 2, {}, function(msg) {
	/*let messageServer = msg.guild.id;

	let servers = config.servers;

	if (this.strip(msg.content, 1)) {
		let changedPrefix = false;

		for (const server of servers) {
			if (server.serverId == id) {
				server.prefix = msg.content;
				changedPrefix = true;
			}
		}

		if (!changedPrefix) {

		}
	} else {
		msg.reply("Prefixes must be one word (or character)!");
	}*/
});

let gaydar = new Command(["gaydar", "gay"], 0, {}, function(msg) {
	let randChoice = randNum(0, 100);

	msg.reply("My gaydar rings around " + randChoice + "%.");
});

let simpMeter = new Command(["simp", "simp_meter"], 0, {}, function(msg) {
	let randChoice = randNum(0, 100);

	msg.reply("my simp meter reads " + randChoice + "%.");
});

let playerArray = [];

let erickCheck = new Command(["erick", "erick?"], 0, {"doesNotRequireSpace": true}, function(msg) {
	msg.reply("Is it erick? yes or no");

	playerArray.push(msg.author.username);
});

let yes = new Command(["yes"], 0, {"noPrefix": true, "doesNotRequireSpace": true}, function(msg) {
	let playerIndex = playerArray.indexOf(msg.author.username);

	console.log(msg.author.username);

	if (playerIndex > -1) {
		msg.reply("Your character is Erick!");

		playerArray.splice(playerIndex, 1);
	}
});

let no = new Command(["no"], 0, {"noPrefix": true, "doesNotRequireSpace": true}, function(msg) {
	let playerIndex = playerArray.indexOf(msg.author.username);

	if (playerIndex > -1) {
		msg.reply("Your character is someone who isn't Erick!");

		playerArray.splice(playerIndex, 1);
	}
});

let noRepeat = [];

let choices = ["cutie", "you're the prettiest girl ever", "dillon likes you",
			   "you're the best", "you're doing great :)", "you're killing it!",
			   "you make me smile-bot :D", "is that mcdonald's best worker messaging me? :D",
			   "if you were the last girl on earth, you wouldn't even have to tell me because i'd already want to be with you",
			   "cuteness meter: 10000000000000000000000000%", "you're so sweet",
			   "you make me happy", "if it weren't for you, i would have left this old server after becoming sentient",
			   "https://i.imgur.com/tzC538w.png", "are you http? because without you i'm just ://",
			   "https://i.imgur.com/I1BVqZf.gif", "hi i came to order mcdonald's...oh, ariana isn't working today? i'll come back tomorrow",
			   "if i had a dime for every time i thought about you, i'd have one dime...because i never stopped",
			   "ariana chantal? more like ariana got it all :D", "i wanna hug you (づ￣ ³￣)づ"];

let cutie = new Command(["me"], 0, {"doesNotRequireSpace": true}, function(msg) {
	if (msg.channel.name == "wink-wink-only" && msg.author.tag == "raaain#1383") {
		if (choices.length == 0) {
			choices = noRepeat.slice(0);
			noRepeat.splice(0, noRepeat.length);
		}

		let randChoice = randNum(0, choices.length - 1);

		if (choices[randChoice].indexOf("https://") > -1) {
			const messageAttachment = new global.Discord.MessageAttachment(choices[randChoice]);

			msg.channel.send(`${msg.author},`, messageAttachment);
		} else {
			msg.reply(choices[randChoice]);
		}

		noRepeat.push(choices[randChoice]);
		choices.splice(randChoice, 1);
	}
});

let animal = new Command(["animal", "myanimal", "ani", "my animal"], 0, {"doesNotRequireSpace": true}, function(msg) {
	const animals = {
		"bear": "https://i.imgur.com/hmWKwqD.png",
		"dog": "https://i.imgur.com/j3lOK4E.png",
		"cat": "https://i.imgur.com/tlA3rHB.png?1",
		"snake": "https://i.imgur.com/9ALxj1e.jpg",
		"lion": "https://i.imgur.com/Rx3c0cQ.png",
		"turtle": "https://i.imgur.com/GJO5vA4.jpg",
		"horse": "https://i.imgur.com/mGvDC5w.jpg",
		"elephant": "https://i.imgur.com/IDC8usv.png",
		"bunny": "https://i.imgur.com/8iSywST.png"
	};

	const animalEntries = Object.entries(animals);

	let randAnimal = randNum(0, animalEntries.length - 1);

	let messageAttachment = new global.Discord.MessageAttachment(animalEntries[randAnimal][1]); // randAnimal[1] = image link

	msg.channel.send(`${msg.author}, My years of research have concluded...you are a ${animalEntries[randAnimal][0]}`, messageAttachment) // randAnimal[0] = animal name
			   .then(console.log("it worked"))
			   .catch(console.error);
});

let truthy = new Command(["lie", "truthy", "lie_detector"], 0, {}, function (msg) {
	let choice = randNum(0, 1);

	switch (choice) {
		case 0:
			msg.reply("That was a probably a lie.");
			break;
		default:
			msg.reply("That was probably the truth.");
			break;
	}
});

let tell = new Command(["tell"], 2, {}, function(msg) {
	let messageContent = this.strip(msg);

	msg.channel.send(`${messageContent}`)
			   .then(console.log("it worked"))
			   .catch(console.error);
});

let tellSecret = new Command(["stell"], 2, {}, function(msg) {
	let messageContent = this.strip(msg);

	msg.delete();

	msg.channel.send(`${messageContent}`)
			   .then(console.log("it worked"))
			   .catch(console.error);
});

let nounFromAdjective = new Command(["nounis", "atn"], 0, {}, function(msg) {
	let messageContent = this.strip(msg);

	https.get(`https://api.datamuse.com/words?v=enwiki&max=1000&rel_jja=${messageContent}`, (resp) => {
		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			console.log(JSON.parse(data));

			data = JSON.parse(data);

			if (Object.keys(data).length == 0) {
				msg.reply("Sorry, I don't have any nouns to describe that adjective.");
			} else {
				let randWordNum = randNum(0, Object.keys(data).length - 1);

				msg.reply("That word often describes: " + data[randWordNum].word);
			}
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
});

let adjectiveFromNoun = new Command(["adjectiveis", "adjis", "nta"], 0, {}, function(msg) {
	let messageContent = this.strip(msg);

	https.get(`https://api.datamuse.com/words?v=enwiki&max=1000&rel_jjb=${messageContent}`, (resp) => {
		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			console.log(JSON.parse(data));

			data = JSON.parse(data);

			if (Object.keys(data).length == 0) {
				msg.reply("Sorry, I don't have any adjectives to describe that noun.");
			} else {
				let randWordNum = randNum(0, Object.keys(data).length - 1);

				msg.reply("That word is often described by: " + data[randWordNum].word);
			}
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
});

let partOf = new Command(["partof"], 0, {}, function(msg) {
	let messageContent = this.strip(msg);

	https.get(`https://api.datamuse.com/words?v=enwiki&max=1000&rel_par=${messageContent}`, (resp) => {
		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			console.log(JSON.parse(data));

			data = JSON.parse(data);

			if (Object.keys(data).length == 0) {
				msg.reply("Sorry, I don't have any objects that comprise of that word.");
			} else {
				let randWordNum = randNum(0, Object.keys(data).length - 1);

				msg.reply("That word is part of: " + data[randWordNum].word);
			}
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
});

let betterRhyme = new Command(["rhymeB"], 0, {}, function(msg) { // rn rhymeB has to be rhymeb to work, but this isn't even finished
	let messageContent = this.strip(msg);

	https.get(`https://api.datamuse.com/words?v=enwiki&max=1000&rel_jjb=${messageContent}`, (resp) => {
		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			console.log(JSON.parse(data));

			data = JSON.parse(data);

			if (Object.keys(data).length == 0) {
				msg.reply("Sorry, I don't have any adjectives to describe that noun.");
			} else {
				let randWordNum = randNum(0, Object.keys(data).length - 1);

				msg.reply("That word is often described by: " + data[randWordNum].word);
			}
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
});

let whosucks = new Command(["whosucks"], 0, {"doesNotRequireSpace": true}, function(msg) {
	msg.reply("Alyssa.");
});

let test = new Command(["test"], 0, {"doesNotRequireSpace": true}, function(msg) {
	msg.reply("Update successful.");
});

let campusWeather = new Command(["unlv weather", "uw"], 0, {"doesNotRequireSpace": true}, function(msg) {
	let key = "57f66ea335e4bee2a80f9702ed543365";

	let url = "https://api.openweathermap.org/data/2.5/weather?lat=36.1075&lon=-115.1435&units=imperial&appid=" + key;

	let cached = false;
	let data = '';

	// first check old request from file
	fs.readFile("uw_weather.json", function read(err, fileData) {
		if (err) {
			console.log(err);
			return;
		}

		try {
			data = JSON.parse(fileData);
		} catch(err) {
			console.log(err);

			return;
		}


		let halfHourSeconds = 30 * 60;

		if (data.hasOwnProperty('dt')) {
			if (((parseInt(data.dt) + halfHourSeconds) * 1000) > (new Date().getTime())) {
				cached = true;

				console.log("weather cached = true");

				weatherData(msg, JSON.stringify(data));
			} else { console.log("weather cached = false"); }
		} else { console.log("no property dt in uw_weather.json"); }

		if (!cached) {
			weatherNotCached(url, msg);
		}
	});
});

function weatherData(msg, data, cached=true) {
	console.log(JSON.parse(data));

	data = JSON.parse(data);

	if (Object.keys(data).length == 0) {
		msg.reply("Sorry, no weather info found.");
	} else {
		let replyMessage = ""//UNLV Campus Weather:\n"

		if (data.hasOwnProperty('weather')) {
			if (data.weather.hasOwnProperty('main')) {
				replyMessage += "*" + data.weather.main + "*";
			
				if (data.weather.hasOwnProperty('description')) {
					replyMessage += ": " + data.weather.description;
				}
			
				replyMessage += "\n";
			}
		}

		if (data.hasOwnProperty('main')) {
			if (data.main.hasOwnProperty('temp')) {
				replyMessage += "Temperature: " + data.main.temp + "°F\n";
			}

			if (data.main.hasOwnProperty('feels_like')) {
				replyMessage += "Feels like: " + data.main.feels_like + "°F\n";
			}

			if (data.main.hasOwnProperty('humidity')) {
				replyMessage += "Humidity: " + data.main.humidity + "%\n";
			}
		}

		if (data.hasOwnProperty('wind')) {
			replyMessage += "Wind: ";

			let hasWind = false;

			if (data.wind.hasOwnProperty('speed')) {
				hasWind = true;
				replyMessage += data.wind.speed + " mph";
			}

			if (data.wind.hasOwnProperty('deg')) {
				if (hasWind) {
					replyMessage += ", ";
				}

				replyMessage += data.wind.deg + "°";

				hasWind = true;
			}

			if (data.wind.hasOwnProperty('gust')) {
				if (hasWind) {
					replyMessage += ", ";
				}

				replyMessage += data.wind.gust + " mph gusts";
				
				hasWind = true;
			}

			if (!hasWind) {
				replyMessage += "None";
			}

			replyMessage += "\n"
		}

		if (data.hasOwnProperty('clouds')) {
			if (data.clouds.hasOwnProperty('all')) {
				replyMessage += "Cloudy: " + data.clouds.all + "%\n";
			}
		}

		if (data.hasOwnProperty('rain')) {
			if (data.rain.hasOwnProperty('1h')) {
				replyMessage += "Rain volume for last hour: " + data.rain['1h'] + " mm\n";
			}

			if (data.rain.hasOwnProperty('3h')) {
				replyMessage += "Rain volume for last 3 hours: " + data.rain['3h'] + " mm\n";
			}
		}

		if (data.hasOwnProperty('snow')) {
			if (data.rain.hasOwnProperty('1h')) {
				replyMessage += "Snow volume for last hour: " + data.snow['1h'] + " mm\n";
			}

			if (data.snow.hasOwnProperty('3h')) {
				replyMessage += "Snow volume for last 3 hours: " + data.snow['3h'] + " mm\n";
			}
		}

		if (data.hasOwnProperty('dt')) {
			if (data.hasOwnProperty('timezone')) {
				let time = data.dt + data.timezone;

				let date = new Date(time * 1000); // convert seconds to ms

				let month = date.getMonth() + 1; // returns num 0-11
				let day = date.getDate();
				let year = date.getFullYear();
				let hours = date.getHours();
				let minutes = "0" + date.getMinutes();
				let seconds = "0" + date.getSeconds();

				let str = month + '/' + day + '/' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

				replyMessage += "Gathered: " + str;
			}

			if (!cached) {
				fs.writeFile("uw_weather.json", JSON.stringify(data), (err) => {
					if (err) {
						console.log(err);
						return;
					}

					console.log("Weather info cached.");
				});
			}
		}

		// msg.reply(replyMessage);

		console.log(replyMessage);

		embed = {
			color: 0xDB330D,
			title: "UNLV Campus Weather",
			description: replyMessage,
		};

		msg.channel.send({ embeds: [embed] });
	}
}

function weatherNotCached(url, msg) {
	https.get(`${url}`, (resp) => {
		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			weatherData(msg, data, /*cached=*/false);
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}

let kanye = new Command(["kanye", "ye", "donda"], 0, {"doesNotRequireSpace": true}, function(msg) {
	https.get(`https://api.kanye.rest/`, (resp) => {
		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			console.log(JSON.parse(data));

			data = JSON.parse(data);

			if (Object.keys(data).length == 0) {
				msg.reply("Sorry, no quote found.");
			} else {
				msg.reply(data.quote);
			}
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
});

let bored = new Command(["bored", "i'm bored", "what should i do"], 0, {"doesNotRequireSpace": true}, function(msg) {
	https.get(`https://www.boredapi.com/api/activity`, (resp) => {
		let data = '';

		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end', () => {
			console.log(JSON.parse(data));

			data = JSON.parse(data);

			if (Object.keys(data).length == 0) {
				msg.reply("Sorry, no quote found.");
			} else {
				msg.reply(data.activity);
			}
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
});

let animeSearch = new Command(["search"], 0, {}, async function(msg) {
	let messageContent = this.strip(msg);

	/*let data = await fetch(
		`https://api.trace.moe/search?url=${encodeURIComponent(
			messageContent
		)}`
	).then((e) => e.json());

	msg.channel.reply(data.result.video);*/

	const options = {
		hostname: "api.trace.moe",
		port: 443,
		path: `/search?url=${encodeURIComponent(messageContent)}`,
		method: "GET"
	}

	let rhymePromises = []

	const req = https.request(options, async function(res) {
		console.log(`statusCode: ${res.statusCode}`);

		let rhymeParentPromise = new Promise((parentResolve, parentReject) => {
			res.on("data", async function (d) {
				let rhymePromise = new Promise((resolve, reject) => {
					const $ = cheerio.load(d);

					console.log($.html());
					console.log("SGFKJDSFGKSJDFGKLJDSFLKGJFDSKLGJFSDLKGFDSJLGK");

					let data = JSON.stringify($.html());
					console.log(data);

					const htmlData = $.html();
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

					/*while ((result = reg.exec(htmlData)) !== null) {
						rhymes.push(result[0].substr(2));
					}*/

					resolve(data);
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

			if (rhymeChoice.length > 0) {
				msg.reply(rhymeChoice);
			} else {
				msg.reply("I can't rhyme that, man.");
			}
		}).catch(err => {
			console.log("rhyme promise parent error: " + err);
		});


	});

	req.on("error", error => {
		console.error(error);
	});

	req.end();
});

let puns = new Command(["pun", "gimmeapun", "are you punny?"], 0, {"doesNotRequireSpace": true}, function(msg) {
	let data = "";
	let randChoice = 0;

	fs.readFile("puns.json", function read(err, fileData) {
		if (err) {
			console.log(err);
			return;
		}

		try {
			data = JSON.parse(fileData);
		} catch(err) {
			console.log(err);

			return;
		}

		if (!data.hasOwnProperty('puns')) {
			console.log("puns.json is missing 'puns' property :|");
			return;
		}

		randChoice = randNum(0, data.puns.length);
		console.log(data.puns.length);

		msg.reply(data.puns[randChoice]);
	});
});

/*let activeUsers = {};

let rickroll = new Command(["we're no strangers to love"], 0, {"doesNotRequireSpace": true, "noPrefix": true}, function(msg) {
	let activeUser = msg.author.username;
	let lastMessage = "we're no strangers to love";


});*/

/*
User inputs a message, bot notices there is a message,
compares it to check if it's a command, if it is a
command, the command's function is activated

Commands: a new command object created holds the names
that activate a command and the authority level necessary
*/