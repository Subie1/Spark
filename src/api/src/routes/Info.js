const express = require("express");
const { readFileSync } = require("fs");
const router = express.Router();

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

router.get("/version/client", (_, res) => {
	res.status(200).end(config.CLIENT_VERSION);
});

router.get("/version/api", (_, res) => {
	res.status(200).end(config.API_VERSION);
});

module.exports = router;
