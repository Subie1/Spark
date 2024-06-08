const express = require("express");
const User = require("../lib/User");
const { readFileSync } = require("fs");

const router = express.Router();

const config = JSON.parse(readFileSync("./config.json", "utf-8"));
const settings = MainStorage.box("settings");

/*
{
    notifications: {
        type: "boolean",
        value: true,
    },
    bio: {
        type: "string",
        value: "",
    },
    description: {
        type: "string",
        value: "",
    },
    ring: {
        type: "hex",
        value: "#ffffff"
    },
    hobbies: {
        type: "object:array",
        value: []
    },
}

"The request doesn't match the type needed trying to set a "boolean" to a "object""
*/

router.get("/", (req, res) => {
	const user = User(req.headers.authorization);

	if (!settings.has(user.id)) settings.set(user.id, config.DEFAULT_SETTINGS);
	return res.status(200).json(settings.get(user.id));
});

router.put("/modify/:setting", (req, res) => {
	const user = User(req.headers.authorization);
	const query = req.params.setting.toLowerCase().trim();
	if (!settings.has(user.id))
		return res.status(417).end("Error occurred, please retry again later <3");

    if (req.body.value === undefined) return res.status(400).end("You need to provide a value to change the setting to");

	const setting = settings.get(user.id);
	if (!setting[query])
		return res.status(400).end("You're trying to change an invalid setting");
    if (!matchesType(req.body.value, setting[query].type)) return res
			.status(400)
			.end(
				`The request doesn\'t match the type needed trying to set a "${setting[query].type}" to a "${typeof(req.body.value)}"`
			);
    
    setting[query].value =
			setting[query].type === "hex"
				? req.body.value.match(/#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?/g)[0]
				: req.body.value;
    settings.set(user.id, setting);

    return res.status(200).end();
});

function matchesType(value, type) {
    switch (type) {
        case "boolean":
            return typeof value === "boolean";
        case "string":
            return typeof value === "string";
        case "number":
            return typeof value === "number";
        case "array":
            return Array.isArray(value);
        case "hex":
            if (typeof value !== "string") return false;
            const matched = value.match(/#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?/g);
            return matched ? matched.length : false;
        default:
            return false;
    }
}

module.exports = router;
