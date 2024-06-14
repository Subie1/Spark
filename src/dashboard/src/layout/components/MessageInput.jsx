import axios from "axios";
import Icon from "./Icon";
import Upload from "./Upload";
import { useContext } from "react";
import { context } from "../../lib/Context";

export default function MessageInput({ isDM }) {
	const { host, channel, dm } = useContext(context);

	async function SendMessage(event) {
		event.preventDefault(true);

		if (!isDM) {
			if (!channel) return;

			const inputs = document.querySelectorAll("#form_data input");
			const data = {};
			for (const input of inputs) {
				data[input.name] = input.value.trim();
				input.value = "";
			}

			return axios.post(`${host}/api/channels/${channel.channel}/messages/send`, data);
		}

		if (!dm) return;

		const inputs = document.querySelectorAll("#form_data input");
		const data = {};
		for (const input of inputs) {
			data[input.name] = input.value.trim();
			input.value = "";
		}

		return axios.post(
			`${host}/api/users/friends/dm/${dm.token}/messages/send`,
			data
		);
	}

	return (
		<form
			id="form_data"
			onSubmit={SendMessage}
			className="flex items-center relative justify-center rounded-lg w-full px-2 py-2 bg-background border border-text/10"
		>
			<Upload />
			<input
				autoComplete="off"
				name="content"
				placeholder="Send a message in #General"
				type="text"
				className="w-full h-fit bg-transparent outline-none placeholder-text/30 text-text/70"
			/>
			<button
				type="submit"
				className="cursor-pointer p-2 text-lg bg-gradient-to-br from-primary to-accent rounded-full"
			>
				<Icon name="TbSend" />
			</button>
		</form>
	);
}
