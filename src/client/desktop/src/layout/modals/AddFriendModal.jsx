import { useContext, useRef } from "react";
import Icon from "../components/Icon";
import { context } from "../../lib/Context";
import axios from "axios";

export default function AddFriendModal() {
	const input = useRef(null);
	const { host, setModal } = useContext(context);

	async function sendRequest() {
		if (!input.current) return setModal(false);

		const value = input.current.value;
		axios
			.post(`${host}/api/users/friends/request`, {
				name: value.trim().toLowerCase().replace(/ /g, "_"),
			})
			.then(() => {
				setModal(false);
				input.current.value = "";
			});
	}

	return (
		<div className="py-2 flex flex-col gap-4 w-full h-full">
			<header className="transition-all duration-300  flex gap-20 items-center justify-between text-3xl px-4 pb-2 border-b border-b-text/10">
				Add Friend
				<a
					onClick={() => setModal(false)}
					className="text-sm hover:text-text/60 transition-all duration-300 text-text/40 p-2 cursor-pointer"
				>
					<Icon name="TbX" />
				</a>
			</header>
			<div className="flex flex-col px-4 gap-2">
				<span className="text-sm text-text/80">Username</span>
				<input
					autoComplete="off"
					onKeyDown={(event) => {
						if (event.key.toLowerCase() !== "enter") return;
						event.preventDefault(true);
						sendRequest();
					}}
					ref={input}
					name="name"
					placeholder="Username"
					className="outline-none transition-all duration-300 hover:border-text/30 focus:hover:border-text/70 focus:border-text/50 px-4 py-2 rounded-lg bg-background border border-text/20 placeholder-text/40 text-text/80"
					type="text"
				/>
			</div>
			<div className="px-4 flex gap-2 items-center justify-center w-full">
				<button
					onClick={() => setModal(false)}
					className="px-4 py-2 hover:bg-text/10 transition-all duration-300 bg-text/5 rounded-xl"
				>
					Cancel
				</button>
				<button
					onClick={() => sendRequest()}
					type="submit"
					className="px-4 py-2 bg-gradient-to-br transition-all duration-300 hover:bg-secondary/60 from-primary/40 to-accent/40 rounded-xl"
				>
					Send request
				</button>
			</div>
		</div>
	);
}
