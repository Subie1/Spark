const express = require("express");
const User = require("../lib/User");
const { randomBytes, createHash } = require("crypto");
const { readFileSync } = require("fs");
const Relationship = require("../lib/Relationship");

const router = express.Router();

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

const algorithm = process.env.ALGORITHM || "sha256";

const users = MainStorage.box("users");
const relationships = MainStorage.box("relationships");
const messages = MainStorage.box("messages");

router.use("/dm/:token/messages", (req, res, next) => {
	const user = User(req.headers.authorization);

	if (!messages.has(req.params.token))
		return res.status(404).end("Invalid relationship token linked");
	const relationship = Relationship(req.params.token);

	if (!relationship)
		return res.status(400).end("Invalid relationship token linked");

	if (user.id !== relationship.owner && user.id !== relationship.friend)
		return res.status(401).end("You don't have permission to view this DM");

	res.locals.relationship = relationship;
	next();
});

router.use("/dm/:token/messages", require("./DM"));

router.post("/request", (req, res) => {
	if (!req.body.name)
		return res.status(400).end("You didn't provide an name to request");

	const friend = User.fromName(req.body.name);
	const user = User(req.headers.authorization);

	if (friend.id === user.id)
		return res.status(400).end("You can't add yourself as a friend");

	if (!friend) return res.status(404).end("User doesn't exist");
	if (user.friends.includes(friend.id)) res.status(400).end("You already have that user friended");
	if (user.pending.includes(friend.id))
		return res
			.status(400)
			.end("You've already asked this person for a relationship");

	users.set(friend.id, {
		...friend,
		pending: [...friend.pending, user.id],
	});
	users.set(user.id, {
		...user,
		requests: [...user.requests, friend.id],
	});

	res.status(200).end();
});

router.post("/redact", (req, res) => {
	if (!req.body.id)
		return res.status(400).end("You didn't provide an ID to redact");

	const user = User(req.headers.authorization);
	if (!user.requests.includes(req.body.id))
		return res.status(400).end("You never asked that user for a relationship");

	users.set(user.id, {
		...user,
		pending: user.requests.filter((friend) => friend !== req.body.id),
	});
	users.set(req.body.id, {
		...users.get(req.body.id),
		pending: users
			.get(req.body.id)
			.pending.filter((friend) => friend !== user.id),
	});

	io.emit(user.token, "redact", req.body.id);
	io.emit(users.get(req.body.id).token, "redacted", user.id);

	res.status(200).end();
});

router.post("/decline", (req, res) => {
	if (!req.body.id)
		return res.status(400).end("You didn't provide an ID to decline");

	const user = User(req.headers.authorization);
	if (!user.pending.includes(req.body.id))
		return res.status(400).end("That user never asked you for a relationship");

	users.set(user.id, {
		...user,
		pending: user.pending.filter((friend) => friend !== req.body.id),
	});
	users.set(req.body.id, {
		...users.get(req.body.id),
		requests: users
			.get(req.body.id)
			.requests.filter((friend) => friend !== user.id),
	});

	io.emit(user.token, "decline", req.body.id);
	io.emit(users.get(req.body.id).token, "declined", user.id);

	res.status(200).end();
});

router.post("/accept", (req, res) => {
	if (!req.body.id)
		return res.status(400).end("You didn't provide an ID to accept");

	const user = User(req.headers.authorization);
	if (!user.pending.includes(req.body.id))
		return res.status(400).end("That user never asked you for a relationship");

	const id = randomBytes(config.ID_BYTE_SIZE).toString("hex");
	const token = `${id}.${createHash(algorithm)
		.update(`${id}.${user.id}.${req.body.id}`)
		.update(createHash(algorithm).update(id, "utf8").digest("hex"))
		.digest("hex")}`;

	if (!relationships.has(user.id)) {
		relationships.set(user.id, [
			{
				friend: req.body.id,
				added_timestamp: Date.now(),
				first: true,
				messages: token,
			},
		]);
	} else {
		relationships.set(user.id, [
			...relationships.get(user.id),
			{
				friend: req.body.id,
				added_timestamp: Date.now(),
				messages: token,
			},
		]);
	}

	if (!relationships.has(req.body.id)) {
		relationships.set(req.body.id, [
			{
				friend: user.id,
				added_timestamp: Date.now(),
				first: true,
				messages: token,
			},
		]);
	} else {
		relationships.set(req.body.id, [
			...relationships.get(req.body.id),
			{
				friend: user.id,
				added_timestamp: Date.now(),
				messages: token,
			},
		]);
	}

	messages.set(token, []);

	users.set(user.id, {
		...user,
		friends: [...user.friends, req.body.id],
		pending: user.pending.filter((friend) => friend !== req.body.id),
	});
	users.set(req.body.id, {
		...users.get(req.body.id),
		friends: [...users.get(req.body.id).friends, user.id],
		requests: users
			.get(req.body.id)
			.requests.filter((friend) => friend !== user.id),
	});

	io.emit(user.token, "accept", req.body.id);
	io.emit(users.get(req.body.id).token, "accepted", user.id);

	return res.status(200).end();
});

router.get("/", (req, res) => {
	const user = User(req.headers.authorization);
	return res.status(200).json({ friends: user.friends });
});

router.get("/:id", (req, res) => {
	const user = User(req.headers.authorization);
	if (!relationships.get(user.id))
		return res.status(404).end("You don't have any relationships");

	const ships = relationships.get(user.id);
	if (!ships.map((friend) => friend.friend).includes(req.params.id))
		return res
			.status(404)
			.end("You don't have any relationships with that person");

	const relation =
		ships[ships.map((friend) => friend.friend).indexOf(req.params.id)];
	return res.status(200).json({
		...relation,
		name: users.get(req.params.id).name,
		status: users.get(req.params.id).status,
	});
});

module.exports = router;
