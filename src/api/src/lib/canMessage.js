const User = require("./User");
const { readFileSync } = require("fs");

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

module.exports = (req, res) => {
	if (!req.body.content) {
		res.status(400).end("Invalid content.");
		return false;
	}

	if (!req.body.content.trim().length) {
		res.status(400).end("Invalid content.");
		return false;
	}

	if (req.body.content.trim().length < config.MIN_MESSAGE_LENGTH) {
		res
			.status(400)
			.end("Content must be at least " + config.MIN_MESSAGE_LENGTH + ".");
		return false;
	}

	if (req.body.content.trim().length > config.MAX_MESSAGE_LENGTH) {
		res
			.status(400)
			.end("Content can't be longer than " + config.MAX_MESSAGE_LENGTH + ".");
		return false;
	}

	return true;
};

function isASCII(str) {
	if (typeof str !== "string") {
		return false;
	}
	for (var i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 127) {
			return false;
		}
	}
	return true;
}
