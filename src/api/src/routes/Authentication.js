const express = require("express");
const { readFileSync } = require("fs");
const { createHash, randomBytes } = require("crypto");
const canAuthenticate = require("../lib/canAuthenticate");

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

const algorithm = process.env.ALGORITHM || "sha256";
const users = MainStorage.box("users");
const settings = MainStorage.box("settings");

const router = express.Router();
router.use("/ping", require("../middleware/Authentication"));

router.get("/ping", (_, res) => {
	return res.status(200).end();
});

router.post("/login", (req, res) => {
	if (!canAuthenticate(req, res)) return;

	for (const member of Array.from(users.values())) {
		if (member.name !== req.body.name.trim().toLowerCase().replace(/ /g, "_"))
			continue;
		if (!member.id) continue;

		const token = `${member.id}.${createHash(algorithm)
			.update(req.body.password.trim())
			.update(createHash(algorithm).update(member.id, "utf8").digest("hex"))
			.digest("hex")}`;

		if (member.token === token) return res.status(200).json(member);
	}

	return res.status(403).end("Name or password is incorrect.");
});

router.post("/register", (req, res) => {
	if (!canAuthenticate(req, res, true)) return;

	const members = Array.from(users.values()).filter((member) => member.name);

	for (const member of members)
		if (member.name === req.body.name.trim().toLowerCase().replace(/ /g, "_"))
			return res.status(406).end("Name already in use.");

	const id = randomBytes(config.ID_BYTE_SIZE).toString("hex");
	const token = `${id}.${createHash(algorithm)
		.update(`${req.body.password.trim()}`)
		.update(createHash(algorithm).update(id, "utf8").digest("hex"))
		.digest("hex")}`;

	const user = {
		status: "online",

		id,
		username: req.body.name.trim(),
		name: req.body.name.trim().toLowerCase().replace(" ", "_"),
		token,
		admin: members.length ? false : true,

		pending: [],
		requests: [],

		friends: [],
		groups: ["global"],
	};

	settings.set(id, config.DEFAULT_SETTINGS);

	users.set(id, user);
	return res.status(201).json(user);
});

module.exports = router;
