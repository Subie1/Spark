const Storage = require("salvis");
const { existsSync, mkdirSync, writeFileSync } = require("fs");

const dataPath = process.env.DATA_FOLDER || "./src/data";

global.MainStorage = new Storage("main_storage", { path: dataPath });
const groups = MainStorage.box("groups");
const channels = MainStorage.box("channels");

if (!groups.has("global"))
	MainStorage.box("groups").set("global", {
		id: "global",
		name: "Global",
		owner: "7b75dbc03d49",
		channels: ["general", "off-topic"],
	});

if (!channels.has("general"))
	MainStorage.box("channels").set("general", {
		name: "General",
		id: "general",
		description: "💬 Just chat and have fun!",
		group: "global",
		messages: [],
	});
if (!channels.has("off-topic"))
	MainStorage.box("channels").set("off-topic", {
		name: "Off-Topic",
		id: "off-topic",
		description: "💬 Just chat and have fun!",
		group: "global",
		messages: [],
	});

if (!existsSync(dataPath)) mkdirSync(dataPath, { recursive: true });
if (!existsSync("./config.json")) {
	console.log(
		" BACKEND ".bgWhite.black +
			" Config doesn't exist in: " +
			"./config".yellow +
			" (creating...)"
	);

	writeFileSync(
		"./config.json",
		JSON.stringify({
			MAX_NAME_LENGTH: 16,
			MIN_NAME_LENGTH: 3,

			MAX_PASSWORD_LENGTH: 40,
			MIN_PASSWORD_LENGTH: 8,

			MAX_MESSAGE_LENGTH: 1000,
			MIN_MESSAGE_LENGTH: 1,

			ID_BYTE_SIZE: 6,

			DEFAULT_SETTINGS: {
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
					value: "#ffffff",
				},
				hobbies: {
					type: "object:array",
					value: [],
				},
			},
		}),
		"utf-8"
	);
}
