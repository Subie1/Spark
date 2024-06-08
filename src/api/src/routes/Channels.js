const express = require("express");
const User = require("../lib/User");
const router = express.Router();

const groups = MainStorage.box("groups");
const channels = MainStorage.box("channels");

router.use(require("../middleware/Authentication"));

router.use("/:id/messages", (req, res, next) => {
	if (!channels.has(req.params.id))
		return res.status(404).end("Channel with that ID doesn't exist");
	const channel = channels.get(req.params.id);

	if (!groups.has(channel.group))
		return res.status(404).end("Server with that ID doesn't exist");

	const group = groups.get(channel.group);

	if (!group.members) {
		res.locals.group = channel.group;
		res.locals.channel = req.params.id;
		return next();
	}

	if (!group.private) {
		res.locals.group = channel.group;
		res.locals.channel = req.params.id;
		return next();
	}

	const user = User(req.headers.authorization);
	if (!group.members.includes(user.id))
		return res.status(401).end("You don't have permission to view this server");

	res.locals.group = channel.group;
	res.locals.channel = req.params.id;
	return next();
});

router.use("/:id/messages/", require("./Messages"));

router.get("/:id", (req, res) => {
	if (!channels.has(req.params.id))
		return res.status(404).end("Channel with that ID doesn't exist");
	const channel = channels.get(req.params.id);

	if (!groups.has(channel.group))
		return res.status(404).end("Server with that ID doesn't exist");

	const group = groups.get(channel.group);

	if (!group.members) return res.status(200).json(channel);
	if (!group.private) return res.status(200).json(channel);

	const user = User(req.headers.authorization);
	if (!group.members.includes(user.id))
		return res.status(401).end("You don't have permission to view this server");
	return res.status(200).json(channel);
});

module.exports = router;
