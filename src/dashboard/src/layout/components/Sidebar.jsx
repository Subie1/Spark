import axios from "axios";
import Group from "./Group";
import Icon from "./Icon";
import { useContext, useEffect, useState } from "react";
import { context } from "../../lib/Context";
import LogoutConfirmModal from "../modals/LogoutConfirmModal";
import SettingsModal from "../modals/SettingsModal";
import GroupCreationModal from "../modals/GroupCreationModal";

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

export default function Sidebar() {
	const [query, setQuery] = useState("");

	const [username, setUsername] = useState("guest");

	const [rendered, setRendered] = useState([]);
	const [response, setResponse] = useState([]);

	const [color, setColor] = useState("#ffffff");

	const { host, groups, setPage, setChannel, setModal, rgb } =
		useContext(context);

	function onSearch(event) {
		setQuery(event.target.value);
		setRendered(
			response.filter((r) =>
				r.name.toLowerCase().includes(event.target.value.toLowerCase())
			)
		);
	}

	useEffect(() => {
		axios.get(`${host}/api/users/me`).then(({ data }) => {
			setUsername(data.username + ":" + data.id);
		});

		(async () => {
			const result = [];

			for (const group of groups) {
				const { data } = await axios.get(`${host}/api/groups/${group}`);
				result.push(data);
			}

			setResponse(result);
			setRendered(result);
		})();
	}, [groups]);

	useEffect(() => {
		axios.get(`${host}/api/users/me/settings`).then(async ({ data }) => {
			setColor(data.ring.value);
		});
	}, [rgb]);

	return (
		<nav className="h-full overflow-y-auto p-2 flex flex-col items-center justify-between">
			<div className="gap-2 flex flex-col">
				<div className="w-full flex items-center justify-center">
					<div className="h-[1px] mx-2 w-full rounded-full bg-text/10"></div>
					<div className="gap-2 scale-110 flex items-center justify-between text-md text-text/30">
						<a className="relative">
							{/* <div className="flex items-center justify-center absolute bottom-2 left-2 text-xs rounded-full bg-red-500 w-4 h-4">
								<span className="text-white">0</span>
							</div> */}
							<Icon name="TbBell" className="text-text/40 cursor-pointer" />
						</a>
						<a onClick={() => setModal(<GroupCreationModal />)}>
							<Icon name="TbPlus" className="text-text/40 cursor-pointer" />
						</a>
					</div>
				</div>
				<div className="flex flex-col gap-1 w-full items-start text-text/30 justify-start">
					<a
						onClick={() => {
							setPage(1);
							setChannel(false);
						}}
						className="w-full px-2 py-1 flex gap-2 items-center justify-start rounded-lg cursor-pointer hover:bg-text/5 transition-all duration-300"
					>
						<Icon
							name="TbFriends"
							className="text-lg text-transparent fill-text/20"
						/>
						<span className="text-sm">Friends</span>
					</a>
					<form
						onSubmit={(event) => event.preventDefault(true)}
						className="my-4 hover:border-text/30 focus-within:hover:border-text/70 focus-within:border-text/50 transition-all duration-300 w-full px-2 py-1 gap-2 rounded-full border border-text/20 flex items-center justify-center"
					>
						<button type="submit">
							<Icon name="TbSearch" className="text-lg text-text/30" />
						</button>
						<input
							value={query}
							onChange={onSearch}
							autoComplete="off"
							name="search_input"
							type="text"
							placeholder="Search"
							className="w-full h-full bg-transparent outline-none placeholder-text/20 text-text/70"
						/>
					</form>
				</div>
				<div className="my-2 flex flex-col gap-1 w-full items-start text-text/30 justify-start">
					<header className="px-2 text-text/70 uppercase text-xs">
						Groups
					</header>
					{rendered.length
						? rendered.map((group) => {
								return (
									<Group
										key={group.id}
										name={group.name}
										id={group.id}
										channels={group.channels}
										emoji="World"
									/>
								);
						  })
						: groups.map((g) => {
								return (
									<div key={g} className="flex flex-col gap-2 w-full">
										<div className="w-full px-2 py-1 flex text-transparent animate-pulse items-center justify-between rounded-lg bg-text/5">
											<div className="flex gap-2 items-center justify-center">
												<Icon name="TbWorld" className="text-lg" />
											</div>
										</div>
									</div>
								);
						  })}
				</div>
			</div>
			<div className="w-full flex items-center justify-between">
				<div className="flex items-center justify-start gap-2">
					<img
						style={{
							"--tw-ring-opacity": 1,
							"--tw-ring-color": `rgb(${RGBConvert(color).r} ${
								RGBConvert(color).g
							} ${RGBConvert(color).b} / var(--tw-ring-opacity))`,
						}}
						src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${
							username.split(":")[1]
						}`}
						className="w-7 h-7 rounded-full shadow-background/40 shadow-md ring-2 ring-offset-background/80 ring-offset-2"
					/>
					<span>{username.split(":")[0]}</span>
				</div>
				<div className="flex items-center justify-center gap-px">
					<a
						onClick={() => setModal(<SettingsModal />)}
						className="rounded-lg group rounded-r-none px-2 py-2 bg-text/5 cursor-pointer hover:bg-text/10 transition-all duration-300"
					>
						<Icon
							name="TbSettings"
							className="text-xl text-transparent fill-text/20 transition-all duration-300 group-hover:rotate-45"
						/>
					</a>
					<a
						onClick={() => setModal(<LogoutConfirmModal />)}
						className="rounded-lg group rounded-l-none px-2 py-2 bg-text/5 cursor-pointer hover:bg-text/10 transition-all duration-300"
					>
						<Icon
							name="TbLock"
							className="text-xl text-transparent fill-text/20 transition-all duration-300 group-hover:-rotate-45"
						/>
					</a>
				</div>
			</div>
		</nav>
	);
}
