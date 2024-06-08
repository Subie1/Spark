import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Toggle from "../../components/Toggle";
import { context } from "../../../lib/Context";

function RenderTheme({ name, value }) {
	const { theme, setTheme } = useContext(context);

	return (
		<div onClick={() => setTheme(value)} className={`${value} cursor-pointer flex flex-col items-center justify-center`}>
			<div className={`${value === theme ? "border border-secondary" : ""} size-10 rounded-full bg-background`}></div>
			<span className="text-xs">{name}</span>
		</div>
	);
}

export default function GeneralSettings() {
	const [notifications, setNotifications] = useState(false);
	const { host } = useContext(context);

	const themes = [
		{ name: "Light", value: "light" },
		{ name: "Snow", value: "snow" },
		{ name: "Honey", value: "honey" },
		{ name: "Dark", value: "dark" },
		{ name: "Peach", value: "peach" },
		{ name: "Comfy", value: "comfy" },
	];

	useEffect(() => {
		axios.get(`${host}/api/users/me/settings`).then(({ data }) => {
			setNotifications(data.notifications.value);
		});
	}, []);

	useEffect(() => {
		axios.put(`${host}/api/users/me/settings/modify/notifications`, {
			value: notifications,
		});
	}, [notifications]);

	return (
		<main className="h-full w-96 flex flex-col gap-2 text-text/60">
			<div className="flex flex-col w-full gap-2">
				<header className="text-md text-text/90">General</header>
				<div className="w-full h-full flex flex-col gap-1">
					<div className="flex w-full items-center justify-between">
						<span className="text-sm">Notifications</span>
						<div className="pr-6">
							<Toggle
								defaultValue={notifications}
								onChange={(result) => setNotifications(result)}
							/>
						</div>
					</div>
					<div className="flex flex-col w-full items-start justify-center">
						<span className="text-sm">Theme</span>
						<div className="text-text/60 flex flex-wrap gap-1 hover:text-text/80 transition-all duration-300 pr-6">
							{themes.map((t) => (
								<RenderTheme name={t.name} value={t.value} key={t.value} />
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
