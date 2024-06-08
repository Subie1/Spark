const express = require("express");
const User = require("../lib/User");
const { readFileSync } = require("fs");
const { randomBytes } = require("crypto");
const router = express.Router();

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const groups = MainStorage.box("groups");
const channels = MainStorage.box("channels");

router.use(require("../middleware/Authentication"));

router.get("/:id", (req, res) => {
	if (!groups.has(req.params.id))
		return res.status(404).end("Server with that ID doesn't exist");
	const group = groups.get(req.params.id);

	if (!group.members) return res.status(200).json(group);
	if (!group.private) return res.status(200).json(group);

	const user = User(req.headers.authorization);
	if (!group.members.includes(user.id))
		return res.status(401).end("You don't have permission to view this server");
	return res.status(200).json(group);
});

router.post("/create", (req, res) => {
	if (!req.body.name)
		return res.status(400).end("Group name is a required field");
	if (!req.body.name.trim().length)
		return res.status(400).end("Group name is a required field");
	if (!req.body.channels)
		return res.status(400).end("Minimum amount of channels needed is 1");
	if (!req.body.channels.length)
		return res.status(400).end("Minimum amount of channels needed is 1");

	const user = User(req.headers.authorization);
	const gId = randomBytes(config.ID_BYTE_SIZE).toString("hex");

	const result = [];

	for (const channel of req.body.channels) {
		const cId = randomBytes(config.ID_BYTE_SIZE).toString("hex");
		channels.set(cId, {
			id: cId,
			name: channel,
			messages: [],
			group: gId,
			description: "No Description",
		});

        result.push(cId);
	}

	const group = { channels: result, id: gId, owner: user.id, name: req.body.name };

	groups.set(gId, group);
	user.groups.push(gId);

	res.status(200).json(group);
});

module.exports = router;
