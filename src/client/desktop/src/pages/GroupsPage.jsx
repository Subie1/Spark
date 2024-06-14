import { useContext, useEffect, useRef, useState } from "react";
import MessageInput from "../layout/components/MessageInput";
import Title from "../layout/components/Title";
import Message from "../layout/components/Message";
import { io } from "socket.io-client";
import { context } from "../lib/Context";
import axios from "axios";
import ScrollDown from "../layout/components/ScrollDown";

export default function GroupsPage() {
	const container = useRef(null);
	const scrollToRef = useRef(null);

	const [loaded, setLoaded] = useState(false);
	const [messages, setMessages] = useState([]);
	const [token, setToken] = useState(false);
	const { host, channel } = useContext(context);

	function scrollTo(element, to, duration) {
		if (duration <= 0) return;
		var difference = to - element.scrollTop;
		var perTick = (difference / duration) * 10;

		setTimeout(function () {
			element.scrollTop = element.scrollTop + perTick;
			if (element.scrollTop === to) return;
			scrollTo(element, to, duration - 10);
		}, 10);
	}

	async function loadAbove() {
		if (!container.current) return;

		const percent =
			container.current.scrollTop / container.current.scrollHeight;
		if (percent > 0.05) return;

		const { data } = await axios.get(
			`${host}/api/channels/${channel.channel}/messages?before=${messages[0].timestamp}&amount=50`
		);
		const result = [];

		for (const message of data) {
			setMessages((previous) => {
				if (previous.filter((m) => m.id === message.id).length) return previous;
				result.push(message);
				return previous;
			});
		}

		setMessages((previous) => [...result, ...previous]);
	}

	useEffect(() => {
		setLoaded(false);
	}, [channel]);

	useEffect(() => {
		if (!container.current) return;
		if (!messages.length) return;

		container.current.addEventListener("scroll", loadAbove);

		return () => {
			if (!container.current) return;
			container.current.removeEventListener("scroll", loadAbove);
		};
	}, [container.current, messages]);

	useEffect(() => {
		if (!token) return;

		const socket = io(host);
		socket.on(token, (event, message) => {
			if (event === "add") {
				setMessages((previous) => [...previous, message]);

				if (!container.current) return;
				scrollTo(container.current, 9999, 200);
			}

			if (event === "delete") {
				setMessages((previous) => previous.filter((m) => m.id !== message.id));
			}

			if (event === "edit") {
				setMessages((previous) => {
					const index = Array.from(previous)
						.map((m) => m.id)
						.indexOf(message.id);
					if (index === -1) return previous;
					const result = Array.from(previous);
					result[index] = message;
					return result;
				});
			}
		});

		return () => {
			socket.close();
		};
	}, [token]);

	useEffect(() => {
		if (!channel) return;

		axios
			.get(`${host}/api/channels/${channel.channel}/messages/subscribe`)
			.then(({ data }) => setToken(data.subscription_token));

		axios
			.get(`${host}/api/channels/${channel.channel}/messages?amount=50`)
			.then(({ data }) => {
				setMessages(data);
			});

		return () => {
			axios
				.delete(`${host}/api/channels/${channel.channel}/messages/unsubscribe`)
				.catch(() => {});
		};
	}, [channel]);

	return (
		<main className="h-full flex flex-col">
			<Title />
			<div
				ref={container}
				className="h-full p-4 flex flex-col gap-3 overflow-y-auto"
			>
				<div className="flex flex-col items-center justify-center">
					<header className="text-xl text-text/80">
						You reached the top of the chat
					</header>
					<span className="italic text-xs text-text/40">
						Encourage other&apos;s to talk by talking first
					</span>
					<hr className="border-text/10 w-[calc(100%-200px)] my-4" />
				</div>
				{messages.length
					? messages.map((message, i) => {
							if (i === messages.length - 1 && !loaded) {
								container.current.scrollTop = container.current.scrollHeight;
								setLoaded(true);
							}

							return (
								<Message
									key={message.id}
									loaded={loaded}
									container={container}
									id={message.id}
									author={message.author}
									content={message.content}
									timestamp={message.timestamp}
									edited={message.edited}
								/>
							);
					  })
					: ""}
				<div ref={scrollToRef} />
			</div>
			<div className="flex relative items-center justify-center p-2">
				<ScrollDown element={container} />
				<MessageInput isDM={false} />
			</div>
		</main>
	);
}
