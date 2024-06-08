const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("http");

require("colors").enable();
require("./src/lib/loadDirectories");

const port = 14269;

const app = express();
const server = createServer(app);

global.io = new Server(server, {
	cors: {
		origin: "*",
		credentials: true,
		allowedHeaders: "*",
		methods: "*",
	},
});

app.use((_, res, next) => {
	res.setHeader("X-Powered-By", "Spark API");
	next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/hi", (_, res) => {
	res.end("Hi or something idk I have social anxiety");
});

app.use("/api/auth", require("./src/routes/Authentication"));
app.use("/api/users", require("./src/routes/Users"));
app.use("/api/groups", require("./src/routes/Groups"));
app.use("/api/channels", require("./src/routes/Channels"));
app.use("/api/info", require("./src/routes/Info"));

server.listen(port, () =>
	console.log(" BACKEND ".bgWhite.black + " Ready on port " + `${port}`.yellow)
);

process.on("uncaughtException", () => {});
process.on("error", () => {});
