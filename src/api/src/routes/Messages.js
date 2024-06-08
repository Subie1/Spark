const express = require("express");
const canMessage = require("../lib/canMessage");
const User = require("../lib/User");
const { createHash, randomBytes } = require("crypto");
const { readFileSync } = require("fs");
const router = express.Router();

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

const algorithm = process.env.ALGORITHM || "sha256";
const channels = MainStorage.box("channels");

const subscriptions = new Map();

router.get("/", (req, res) => {
	if (!req.query.amount)
		return res.status(400).end("Amount query not provided");
	if (isNaN(req.query.amount))
		return res.status(400).end("Amount query must only be a number");
	if (parseInt(req.query.amount) <= 0)
		return res.status(400).end("Amount query can't be less than or equal to 0");
	if (parseInt(req.query.amount) > 100)
		return res.status(400).end("Amount query can't be more than 100");

	const channel = channels.get(res.locals.channel);
	const messages = [...channel.messages];
	const reversed = [...messages.reverse()];

	if (!messages.length) return res.status(200).json(messages);

	condition: if (req.query.before) {
		if (isNaN(req.query.before)) {
			break condition;
		}

		if (parseInt(req.query.before) > messages[0].timestamp) {
			break condition;
		}
		if (parseInt(req.query.before) < messages[messages.length - 1].timestamp) {
			break condition;
		}

		const align = [
			...reversed
				.filter((message) => message.timestamp < req.query.before)
				.slice(0, parseInt(req.query.amount)),
		].reverse();
		return res.status(200).json(align);
	}

	const align = [...reversed.slice(0, parseInt(req.query.amount))].reverse();
	return res.status(200).json(align);
});

router.get("/subscribe", (req, res) => {
	const user = User(req.headers.authorization);
	if (subscriptions.has(user.id))
		return res
			.status(200)
			.json({ subscription_token: subscriptions.get(user.id) });

	const channel = channels.get(res.locals.channel);

	const id = randomBytes(config.ID_BYTE_SIZE).toString("hex");
	const token = `${id}.${createHash(algorithm)
		.update(id)
		.update(user.token)
		.update(createHash(algorithm).update(channel.id, "utf8").digest("hex"))
		.digest("hex")}`;

	subscriptions.set(user.id, token);

	return res.status(200).json({ subscription_token: token });
});

router.delete("/unsubscribe", (req, res) => {
	const user = User(req.headers.authorization);
	if (!subscriptions.has(user.id))
		return res.status(400).end("You aren't subscribed to the channel");

	subscriptions.delete(user.id);
	return res.status(200).end();
});

router.post("/send", (req, res) => {
	if (!canMessage(req, res)) return;

	const user = User(req.headers.authorization);
	const channel = channels.get(res.locals.channel);

	const data = {
		author: user.id,
		content: req.body.content,
		id: crypto.randomUUID(config.ID_BYTE_SIZE).toString("hex"),
		timestamp: Date.now(),
		edited: false,
	};

	const mentions = req.body.content.match(/[@]([\w|\d|_]{0,100})/g);
	if (mentions) {
		for (const mention of mentions) {
			const mentioned = User.fromName(mention.slice(1));
			if (!mentioned) continue;
            
			io.emit(mentioned.token, "mentioned", data);
		}
	}

	channel.messages.push(data);
	channels.set(res.locals.channel, channel);

	for (const subscription of Array.from(subscriptions.values())) {
		io.emit(subscription, "add", data);
	}

	return res.status(200).end();
});

router.delete("/delete/:id", (req, res) => {
	const user = User(req.headers.authorization);
	const channel = channels.get(res.locals.channel);

	const message = channel.messages.filter(
		(message) => message.id === req.params.id
	);
	if (!message.length) return res.status(404).end("Message not found");
	if (user.id !== message[0].author)
		return res.status(401).end("You're not allowed to delete this message");

	const messages = channel.messages.filter((m) => m.id !== message[0].id);
	channel.messages = messages;

	channels.set(res.locals.channel, channel);

	for (const subscription of Array.from(subscriptions.values())) {
		io.emit(subscription, "delete", message[0]);
	}

	return res.status(200).end();
});

router.put("/edit/:id", (req, res) => {
	if (!req.body.content)
		return res.status(400).end("New content wasn't provided");
	if (!canMessage(req, res)) return;

	const user = User(req.headers.authorization);
	const channel = channels.get(res.locals.channel);

	const message = channel.messages.filter(
		(message) => message.id === req.params.id
	);

	if (!message.length) return res.status(404).end("Message not found");
	if (user.id !== message[0].author)
		return res.status(401).end("You're not allowed to edit this message");

	channel.messages[channel.messages.map((m) => m.id).indexOf(message[0].id)] = {
		...message[0],
		content: req.body.content,
		edited: true,
	};
	channels.set(res.locals.channel, channel);

	for (const subscription of Array.from(subscriptions.values())) {
		io.emit(subscription, "edit", {
			...message[0],
			content: req.body.content,
			edited: true,
		});
	}

	return res.status(200).end();
});

module.exports = router;
