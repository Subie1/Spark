import { useContext, useEffect, useState } from "react";
import Icon from "./Icon";
import { context } from "../../lib/Context";
import axios from "axios";

export default function Group({ name, id, channels, emoji }) {
	const [open, setOpen] = useState(false);
	const [rendered, setRendered] = useState([]);
	const { host, setChannel, setPage, channel: c } = useContext(context);

	useEffect(() => {
		(async () => {
			const result = [];

			for (const channel of channels) {
				const { data } = await axios.get(`${host}/api/channels/${channel}`);
				result.push(data);
			}

			setRendered(result);
		})();
	}, [channels]);

	return (
		<div className="flex flex-col gap-2 w-full">
			<div
				onClick={() => setOpen(!open)}
				className={`w-full px-2 py-1 flex gap-2 items-center justify-between rounded-lg cursor-pointer ${
					c
						? c.group === id
							? "hover:bg-text/15 bg-text/10"
							: "hover:bg-text/5"
						: "hover:bg-text/5"
				} transition-all duration-300`}
			>
				<div className="flex gap-2 items-center justify-center">
					<Icon
						name={`Tb${emoji ?? ""}`}
						className="text-lg text-transparent fill-text/20"
					/>
					<span
						className={`text-sm ${
							c
								? c.group === id
									? "text-text/60"
									: "text-text/40"
								: "text-text/20"
						}`}
					>
						{name}
					</span>
				</div>
				<Icon
					name={open ? "TbChevronDown" : "TbChevronUp"}
					className="text-lg text-text/20"
				/>
			</div>
			{open
				? rendered.length
					? rendered.map((channel) => (
							<div
								onClick={() => {
									setChannel({ group: id, channel: channel.id });
									setPage(0);
								}}
								key={channel.id}
								className={`text-xs flex items-center gap-2 justify-start px-5 cursor-pointer ${
									c
										? c.channel === channel.id
											? "hover:text-text/60 text-text/50"
											: "hover:text-text/30 text-text/20"
										: "hover:text-text/30 text-text/20"
								} transition-all duration-300`}
							>
								<Icon name="TbHash" />
								<span>{channel.name}</span>
							</div>
					  ))
					: new Array(5).fill("").map((_, i) => (
							<div
								key={i}
								className="text-xs flex items-center gap-2 justify-start px-5 text-text/20 animate-pulse"
							>
								<Icon name="TbHash" />
								<span>Loading</span>
							</div>
					  ))
				: ""}
		</div>
	);
}
