import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { context } from "../../../lib/Context";
import Icon from "../../components/Icon";

export default function InfoSettings() {
	const [versions, setVersions] = useState({ api: "v0", client: "v0" });
	const [me, setMe] = useState(false);
	const { host } = useContext(context);

	useEffect(() => {
		axios.get(`${host}/api/users/me`).then(({ data }) => {
			setMe(data);
		});

		axios.get(`${host}/api/info/version/client`).then(({ data }) => {
			setVersions((previous) => {
				return { ...previous, client: data };
			});
		});

		axios.get(`${host}/api/info/version/api`).then(({ data }) => {
			setVersions((previous) => {
				return { ...previous, api: data };
			});
		});
	}, []);

	return (
		<main className="h-full w-96 flex flex-col gap-2 text-text/60">
			<div className="flex flex-col w-full gap-2">
				<header className="text-md text-text/90">Profile</header>
				<div className="w-full h-full flex flex-col gap-1 pr-6">
					{me ? (
						me.admin ? (
							<div className="flex w-full items-center justify-between">
								<span className="text-sm">Admin</span>
								<span className="text-xs p-1 rounded-md bg-text/10">
									<Icon
										name="TbShield"
										className="fill-accent/40 text-transparent scale-125"
									/>
								</span>
							</div>
						) : (
							""
						)
					) : (
						""
					)}
					<div className="flex w-full items-center justify-between">
						<span className="text-sm">User ID</span>
						<span className="italic text-xs px-4 py-1 rounded-md bg-text/10">
							{me ? me.id : "Loading..."}
						</span>
					</div>
					<div className="flex w-full items-center justify-between">
						<span className="text-sm">API Version</span>
						<span className="italic text-xs px-4 py-1 rounded-md bg-text/10">
							{versions.api}
						</span>
					</div>
					<div className="flex w-full items-center justify-between">
						<span className="text-sm">Client Version</span>
						<span className="italic text-xs px-4 py-1 rounded-md bg-text/10">
							{versions.client}
						</span>
					</div>
				</div>
			</div>
		</main>
	);
}
