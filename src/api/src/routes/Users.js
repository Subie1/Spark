const express = require("express");
const User = require("../lib/User");
const { readFileSync } = require("fs");

const router = express.Router();
router.use(require("../middleware/Authentication"));

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const users = MainStorage.box("users");
const settings = MainStorage.box("settings");

router.use("/friends", require("./Friends"));
router.use("/me/settings", require("./Settings"));

router.get("/me", (req, res) => {
	const user = User(req.headers.authorization);
	if (!user)
		return res.status(401).end("You need to be logged in to a valid account");

	/* Sensitive Data */
	const { token, ...data } = user;
	return res.status(200).json(data);
});

router.put("/me/idle", (req, res) => {
	if (!req.body.is_idle)
		return res.status(400).end("You didn't provide an is_idle parameter");
	if (!["false", "true"].includes(req.body.is_idle.trim().toLowerCase()))
		return res
			.status(400)
			.end("Only values that can be accepted are true/false");

	const query = req.body.is_idle.trim().toLowerCase();
	const user = User(req.headers.authorization);

	if (query == "false") user.status = "online";
	if (query == "true") user.status = "idle";

	users.set(user.id, user);

	return res.status(200).end();
});

router.get("/:id", (req, res) => {
	if (!users.has(req.params.id))
		return res.status(404).end("User with that id doesn't exist");
	const user = { ...users.get(req.params.id) };
	if (!settings.has(user.id)) settings.set(user.id, config.DEFAULT_SETTINGS);

	/* Sensitive Data */
	const { token, groups, friends, pending, requests, ...data } = user;
	return res
		.status(200)
		.json({ ...data, settings: { ...settings.get(user.id) } });
});

router.get("/query/:name", (req, res) => {
	const user = User.fromName(req.params.name);
	if (!user) return res.status(404).end(`User with name ${req.params.name} was not found`);
	if (!settings.has(user.id)) settings.set(user.id, config.DEFAULT_SETTINGS);

	/* Sensitive Data */
	const { token, groups, friends, pending, requests, ...data } = user;
	return res
		.status(200)
		.json({ ...data, settings: { ...settings.get(user.id) } });
});

module.exports = router;
