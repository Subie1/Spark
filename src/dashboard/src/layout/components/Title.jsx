import { useContext, useEffect, useState } from "react";
import Icon from "./Icon";
import { context } from "../../lib/Context";
import axios from "axios";

export default function Title() {
	const [rendered, setRendered] = useState({ group: false, channel: false });
	const { host, channel } = useContext(context);

	useEffect(() => {
		if (!channel) return;

		axios.get(`${host}/api/groups/${channel.group}`).then(({ data }) => {
			setRendered((previous) => {
				return { ...previous, group: data.name };
			});
		});

		axios.get(`${host}/api/channels/${channel.channel}`).then(({ data }) => {
			setRendered((previous) => {
				return { ...previous, channel: data.name };
			});
		});
	}, [channel]);

	return (
		<nav className="flex gap-2 items-center justify-start px-4 py-4 border-b border-b-text/10 text-text/60">
			<header>Group</header>
			<Icon name="TbChevronRight" className="text-text/20" />

			{rendered.group ? (
				<div className="flex items-center justify-center gap-1">
					<div className="p-1 bg-gradient-to-br from-primary/40 to-accent/40 rounded-lg">
						<Icon name="TbWorld" className="text-transparent fill-text/40" />
					</div>
					<header>{rendered.group}</header>
				</div>
			) : (
				<div className="animate-pulse flex items-center justify-center gap-1">
					<div className="p-1 bg-gradient-to-br from-primary to-accent rounded-lg">
						<Icon name="TbQuestionMark" />
					</div>
					<header>Loading</header>
				</div>
			)}

			<Icon name="TbChevronRight" className="text-text/20" />

			{rendered.channel ? (
				<div className="flex items-center justify-center gap-1">
					<Icon name="TbHash" />
					<header>{rendered.channel}</header>
				</div>
			) : (
				<div className="animate-pulse flex items-center justify-center gap-1">
					<Icon name="TbHash" />
					<header>Loading</header>
				</div>
			)}
		</nav>
	);
}
