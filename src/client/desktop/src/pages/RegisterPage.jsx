import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { context } from "../lib/Context";

import Icon from "../layout/components/Icon";

export default function RegisterPage() {
	const { host, setPage, _setToken, setHost } = useContext(context);

	const [advanced, setAdvanced] = useState(false);
	const [error, setError] = useState("");

	const input = useRef(null);

	async function Registering(event) {
		event.preventDefault(true);

		const inputs = document.querySelectorAll("#form_data input");
		const data = {};
		for (const input of inputs) {
			data[input.name] = input.value;
		}

		try {
			const { data: user } = await axios.post(
				`${host}/api/auth/register`,
				data
			);
			_setToken(user.token);
		} catch (err) {
			setError(err.response.data);
		}
	}

	useEffect(() => {
		if (!error.length) return;
		setTimeout(() => {
			setError("");
		}, 2_000);
	}, [error]);

	function ChangeHost() {
		if (!input.current) return;
		if (!input.current.value) return;
		if (!input.current.value.trim().length) return;

		let query = input.current.value.trim();
		if (query.endsWith("/")) query = query.slice(0, query.length - 1);
		setHost(query);

		input.current.value = "";
	}

	return (
		<form
			name="register_form"
			onSubmit={Registering}
			className="w-full h-full flex flex-col gap-4 items-center justify-between p-6"
		>
			<div></div>
			<div className="w-full h-full flex flex-col gap-4 items-center justify-center">
				<div className="flex flex-col gap-2 items-start justify-start">
					<header className="text-4xl font-bold bg-gradient-to-br py-1 from-primary to-accent text-transparent bg-clip-text">
						Create an account
					</header>
					<span className="text-xs opacity-40">Enter your details below.</span>
				</div>
				<div id="form_data" className="w-5/12 flex flex-col gap-4">
					<input
						autoComplete="off"
						type="text"
						className="w-full py-2 transition-all duration-200 focus:opacity-50 placeholder-text bg-transparent border-b border-b-text opacity-30 outline-none"
						placeholder="Username"
						name="name"
					/>
					<input
						autoComplete="off"
						type="password"
						className="w-full py-2 transition-all duration-200 focus:opacity-50 flex items-center justify-between placeholder-text bg-transparent border-b border-b-text opacity-30 outline-none"
						placeholder="Password"
						name="password"
					/>
					<input
						type="password"
						className="w-full py-2 transition-all duration-200 focus:opacity-50 placeholder-text bg-transparent border-b border-b-text opacity-30 outline-none"
						placeholder="Confirm Password"
						name="passwordConfirm"
					/>
					<span className="text-xs text-red-400">{error}</span>
					<button
						type="submit"
						className="w-full transition-all duration-200 hover:scale-105 text-md font-semibold p-2 rounded-lg text-background bg-gradient-to-r from-primary to-accent"
					>
						Create
					</button>
				</div>
			</div>
			<div className="w-full text-xs flex gap-6 items-center justify-center">
				<span className="opacity-30">Already have an account?</span>
				<button
					onClick={() => setPage(-1)}
					className="bg-secondary transition-all duration-200 hover:scale-105 rounded-lg px-4 py-2"
				>
					Login in
				</button>
			</div>
			<div
				onClick={() => setAdvanced(!advanced)}
				className="w-full cursor-pointer flex items-center justify-center gap-2"
			>
				Advanced <Icon name={advanced ? "TbChevronUp" : "TbChevronDown"} />
			</div>
			<div
				className={`${
					advanced ? "flex" : "hidden"
				} flex-col items-center gap-1 w-full h-fit`}
			>
				<div
					onKeyDown={(event) => {
						if (event.key.toLowerCase() !== "enter") return;

						event.preventDefault(true);
						ChangeHost();
					}}
					className="gap-2 flex items-center justify-center rounded-lg w-2/4 px-2 py-2 bg-background border border-text/10"
				>
					<span className="text-nowrap text-xs opacity-40 p-2">
						Server URL:
					</span>
					<input
						ref={input}
						placeholder={host}
						type="text"
						className="px-4 w-full h-full bg-transparent outline-none placeholder-text/20 text-text/70"
					/>
					<a
						onClick={() => ChangeHost()}
						className="cursor-pointer p-2 text-lg bg-gradient-to-br from-primary to-accent rounded-full"
					>
						<Icon name="TbThumbUp" />
					</a>
				</div>
			</div>
		</form>
	);
}
