const express = require("express");
const canMessage = require("../lib/canMessage");
const User = require("../lib/User");
const { readFileSync } = require("fs");
const router = express.Router();

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const Messages = MainStorage.box("messages");

router.get("/", (req, res) => {
	if (!req.query.amount)
		return res.status(400).end("Amount query not provided");
	if (isNaN(req.query.amount))
		return res.status(400).end("Amount query must only be a number");
	if (parseInt(req.query.amount) <= 0)
		return res.status(400).end("Amount query can't be less than or equal to 0");
	if (parseInt(req.query.amount) > 100)
		return res.status(400).end("Amount query can't be more than 100");

	const messages = [...Messages.get(res.locals.relationship.messages)];
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

router.post("/send", (req, res) => {
	if (!canMessage(req, res)) return;

	const user = User(req.headers.authorization);
	const messages = Messages.get(res.locals.relationship.messages);

	const data = {
		author: user.id,
		content: req.body.content,
		id: crypto.randomUUID(config.ID_BYTE_SIZE).toString("hex"),
		timestamp: Date.now(),
		edited: false,
	};

	messages.push(data);
	Messages.set(res.locals.relationship.messages, messages);

	const other = res.locals.relationship.owner === user.id ? res.locals.relationship.friend : res.locals.relationship.owner;

	io.emit(res.locals.relationship.messages, "add", data);
	io.emit(User.fromID(other).token, "private_dm", data);

	return res.status(200).end();
});

router.delete("/delete/:id", (req, res) => {
	const user = User(req.headers.authorization);
	const query = Messages.get(res.locals.relationship.messages);

	const message = query.filter((message) => message.id === req.params.id);
	if (!message.length) return res.status(404).end("Message not found");
	if (user.id !== message[0].author)
		return res.status(401).end("You're not allowed to delete this message");

	const messages = query.filter((m) => m.id !== message[0].id);
	Messages.set(res.locals.relationship.messages, messages);

	io.emit(res.locals.relationship.messages, "delete", message[0]);

	return res.status(200).end();
});

router.put("/edit/:id", (req, res) => {
	if (!req.body.content)
		return res.status(400).end("New content wasn't provided");
	if (!canMessage(req, res)) return;

	const user = User(req.headers.authorization);
	const query = Messages.get(res.locals.relationship.messages);

	const message = query.filter((message) => message.id === req.params.id);

	if (!message.length) return res.status(404).end("Message not found");
	if (user.id !== message[0].author)
		return res.status(401).end("You're not allowed to edit this message");

	query[query.map((m) => m.id).indexOf(message[0].id)] = {
		...message[0],
		content: req.body.content,
		edited: true,
	};
	Messages.set(res.locals.relationship.messages, query);

	io.emit(res.locals.relationship.messages, "edit", {
		...message[0],
		content: req.body.content,
		edited: true,
	});

	return res.status(200).end();
});

module.exports = router;
