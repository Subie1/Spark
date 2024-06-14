import axios from "axios";
import { io } from "socket.io-client";
import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";

import { useLocalStorage } from "@uidotdev/usehooks";
import { createContext, useEffect, useState } from "react";

const source = axios.CancelToken.source();
axios.defaults.cancelToken = source.token;

(async () => {
	if (!window.__TAURI_IPC__) return;

	let permissionGranted = await isPermissionGranted();
	if (!permissionGranted) {
		const permission = await requestPermission();
		permissionGranted = permission === "granted";
	}
})();

export const context = createContext();
export const ContextProvider = ({ children }) => {
	const [page, setPage] = useState(-1);
	const [loaded, setLoaded] = useState(false);

	const [theme, setTheme] = useLocalStorage("theme", "dark");
	const [rgb, setRGB] = useState("#ffffff");
	const [elements, setElements] = useState([]);
	const [modal, setModal] = useState();

	const [host, setHost] = useLocalStorage("host", `*`);
	const [_token, _setToken] = useLocalStorage("_token", false);

	const [groups, setGroups] = useState(["g1", "g2", "g3", "g4", "g5"]);
	const [channel, setChannel] = useState(false);
	const [dm, setDM] = useState(false);

	useEffect(() => {
		if (host !== "*") return;
		setHost("http://localhost:14269");
	}, [host, setHost]);

	useEffect(() => {
		if (page < 0 && _token) setPage(0);
		if (!_token) return;

		const socket = io(host);

		socket.on(_token, (event, message) => {
			if (document.hasFocus()) return;
			if (!window.__TAURI_IPC__) return;

			if (event === "private_dm") {
				axios
					.get(`${host}/api/users/me/settings`)
					.then(({ data: settings }) => {
						if (!settings.notifications.value) return;
						axios
							.get(`${host}/api/users/${message.author}`)
							.then(({ data }) => {
								sendNotification({
									title: `@${data.name}`,
									body: message.content,
								});
							});
					});
			}

			if (event === "mention") {
				axios
					.get(`${host}/api/users/me/settings`)
					.then(({ data: settings }) => {
						if (!settings.notifications.value) return;
						axios
							.get(`${host}/api/users/${message.author}`)
							.then(({ data }) => {
								sendNotification({
									title: `@${data.name}`,
									body: message.content,
								});
							});
					});
			}
		});

		axios.interceptors.request.use((config) => {
			if (typeof config.headers.Authorization === "string") return config;
			config.headers.Authorization = _token;
			return config;
		});

		axios
			.get(`${host}/api/users/me`)
			.then(({ status, data }) => {
				if (status !== 200) return;
				setGroups(data.groups);
			})
			.catch(() => setPage(-1));

		return () => {
			socket.close();
		};
	}, [_token]);

	useEffect(() => {
		if (channel) return setPage(0);
		if (page === 0 && !channel) return setPage(1);
		if (page < 0) return;

		axios
			.get(`${host}/api/auth/ping`)
			.then(({ status }) => {
				if (status === 200) return setLoaded(true);
				setLoaded(false);
				return setPage(-1);
			})
			.catch(() => setPage(-1));
	}, [page]);

	return (
		<context.Provider
			value={{
				rgb,
				setRGB,

				dm,
				setDM,

				modal,
				setModal,

				elements,
				setElements,

				groups,
				setGroups,

				channel,
				setChannel,

				loaded,

				page,
				setPage,

				theme,
				setTheme,

				host,
				setHost,

				_token,
				_setToken,
			}}
		>
			{children}
		</context.Provider>
	);
};
