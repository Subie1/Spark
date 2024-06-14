import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { context } from "../../lib/Context";
import Icon from "./Icon";

function RGBConvert(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
}

export default function Message({
	loaded,
	container,
	id,
	author,
	content,
	timestamp,
	edited,

	isDM,
}) {
	const input = useRef(null);

	const [isAdmin, setIsAdmin] = useState(false);
	const [isSame, setSame] = useState(false);
	const [rendered, setRendered] = useState({ name: "" });

	const [editing, setEditing] = useState(false);
	const [edit, setEdit] = useState(content);

	const [color, setColor] = useState("#ffffff");
	const [msg, setMsg] = useState("");

	const { host, setElements, channel, dm, rgb } = useContext(context);

	useEffect(() => {
		setMsg(content);
	}, [editing, channel]);

	async function editMe() {
		if (!isDM) {
			await axios.put(
				`${host}/api/channels/${channel.channel}/messages/edit/${id}`,
				{ content: edit }
			);

			setEditing(false);
			return;
		}

		await axios.put(
			`${host}/api/users/friends/dm/${dm.token}/messages/edit/${id}`,
			{ content: edit }
		);

		setEditing(false);
	}

	function deleteMe() {
		if (!isDM) {
			return axios.delete(
				`${host}/api/channels/${channel.channel}/messages/delete/${id}`
			);
		}

		axios.delete(
			`${host}/api/users/friends/dm/${dm.token}/messages/delete/${id}`
		);
	}

	useEffect(() => {
		if (!author) return;

		axios.get(`${host}/api/users/${author}`).then(async ({ data }) => {
			setRendered(data.username + ":" + data.id);
			setIsAdmin(data.admin);

			const { data: user } = await axios.get(`${host}/api/users/me`);
			if (loaded && container.current)
				container.current.scrollTop = container.current.scrollHeight;
			if (user.id === data.id) return setSame(true);

			setSame(false);
		});
	}, []);

	useEffect(() => {
		if (!author) return;

		axios.get(`${host}/api/users/${author}`).then(async ({ data }) => {
			setColor(data.settings.ring.value);
		});
	}, [rgb]);

	if (rendered.length) {
		return (
			<div className="flex flex-col">
				<span
					onContextMenu={() =>
						isSame
							? setElements([
									{
										name: "Copy User ID",
										icon: "TbClipboard",
										action: () => {
											window.navigator.clipboard.writeText(
												rendered.split(":")[1]
											);
										},
									},
							  ])
							: ""
					}
					className="text-text/80 flex gap-2 items-end justify-start"
				>
					<img
						style={{
							"--tw-ring-opacity": 1,
							"--tw-ring-color": `rgb(${RGBConvert(color).r} ${
								RGBConvert(color).g
							} ${RGBConvert(color).b} / var(--tw-ring-opacity))`,
						}}
						src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${
							rendered.split(":")[1]
						}`}
						alt={rendered.split(":")[0]}
						className="w-8 h-8 rounded-full ring-2 ring-offset-background/80 ring-offset-2"
					/>
					<div className="flex items-center justify-start gap-1">
						{rendered.split(":")[0]}{" "}
						{isAdmin ? (
							<div className="text-xs p-1 rounded-md bg-text/10">
								<Icon
									name="TbShield"
									className="fill-accent/40 text-transparent scale-125"
								/>
							</div>
						) : (
							""
						)}
					</div>
				</span>
				<form
					onContextMenu={() =>
						isSame
							? setElements([
									{
										name: "Edit",
										icon: "TbPencil",
										action: () => {
											if (input.current) input.current.focus();
											setEditing(true);
										},
									},
									{ name: "Delete", icon: "TbTrash", action: deleteMe },
									{
										name: "Copy Message ID",
										icon: "TbClipboard",
										action: () => {
											window.navigator.clipboard.writeText(id);
										},
									},
									{
										name: "Copy Text",
										icon: "TbClipboard",
										action: () => {
											window.navigator.clipboard.writeText(msg);
										},
									},
							  ])
							: setElements([
									{
										name: "Copy Message ID",
										icon: "TbClipboard",
										action: () => {
											window.navigator.clipboard.writeText(id);
										},
									},
									{
										name: "Copy Text",
										icon: "TbClipboard",
										action: () => {
											window.navigator.clipboard.writeText(msg);
										},
									},
							  ])
					}
					onSubmit={(event) => {
						event.preventDefault(true);
						editMe();
					}}
					className="mx-9 my-1 shadow-background/40 shadow-md flex flex-col rounded-lg bg-text/5 w-fit h-fit p-2 border border-text/10"
				>
					<input
						ref={input}
						className={`text-text/70 bg-transparent outline-none placeholder-text/20 ${
							editing ? `block` : `hidden`
						}`}
						value={edit}
						onKeyDown={(event) => {
							if (event.key.toLowerCase() !== "escape") return;

							event.preventDefault(true);
							setEdit(content);
							setEditing(false);
						}}
						onChange={(e) => setEdit(e.target.value)}
					/>
					<span
						className={`whitespace-pre-line text-text/70 ${
							editing ? `hidden` : `block`
						}`}
					>
						{msg}
					</span>
					<div className="flex items-center justify-between text-xs text-text/20 gap-4">
						<span>
							{new Date(timestamp).toDateString().split(" ")[0]}{" "}
							{new Date(timestamp)
								.toTimeString()
								.split(" ")[0]
								.split(":")
								.slice(0, 2)
								.map((e, i) => (i === 0 ? parseInt(e) % 12 : parseInt(e) % 60))
								.map((e, i) => (i === 0 ? (e === 0 ? 12 : e) : e))
								.map((e) => (e < 10 ? `0${e}` : e))
								.join(":")}{" "}
							{new Date(timestamp)
								.toTimeString()
								.split(" ")[0]
								.split(":")
								.slice(0, 1)
								.map((e) => (e >= 12 ? "PM" : "AM"))}
						</span>
						{edited ? (
							<span className="italic text-xs text-text/10">Edited</span>
						) : (
							""
						)}
						{editing ? (
							<button type="submit" className="pl-2 text-xs cursor-pointer">
								<Icon
									name="TbCheck"
									className="text-xl text-text/20 transition-all duration-300 group-hover:-rotate-45"
								/>
							</button>
						) : (
							""
						)}
					</div>
				</form>
			</div>
		);
	}

	return "";
}
