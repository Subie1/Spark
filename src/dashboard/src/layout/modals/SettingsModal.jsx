import { useContext, useState } from "react";
import Icon from "../components/Icon";
import { context } from "../../lib/Context";
import GeneralSettings from "./settings/GeneralSettings";
import ProfileSettings from "./settings/ProfileSettings";
import InfoSettings from "./settings/InfoSettings";

function CurrentPage({ page }) {
	if (page === 0) return <GeneralSettings />;
	if (page === 1) return <ProfileSettings />;
	if (page === 4) return <InfoSettings />;
	return <GeneralSettings />;
}

export default function SettingsModal() {
	const [page, setPage] = useState(0);
	const { setModal } = useContext(context);

	return (
		<div className="py-2 flex flex-col gap-4 size-full">
			<header className="w-full flex gap-20 items-center justify-between text-3xl px-4 pb-2 border-b border-b-text/10">
				Settings
				<a
					onClick={() => setModal(false)}
					className="text-sm hover:text-text/60 transition-all duration-300 text-text/40 p-2 cursor-pointer"
				>
					<Icon name="TbX" />
				</a>
			</header>
			<div className="w-full flex px-2 gap-6 items-start justify-start">
				<div className="w-full h-full flex flex-col gap-1">
					<a
						onClick={() => setPage(0)}
						className={`cursor-pointer px-2 py-1 rounded-lg transition-all duration-300 ${
							page === 0 ? "bg-text/10 hover:bg-text/15" : "hover:bg-text/5"
						} flex gap-2 items-center justify-start text-text/60`}
					>
						<Icon
							name="TbSettings"
							className="text-transparent fill-text/40 text-xl"
						/>
						<span>General</span>
					</a>
					<a
						onClick={() => setPage(1)}
						className={`cursor-pointer px-2 py-1 rounded-lg transition-all duration-300 ${
							page === 1 ? "bg-text/10 hover:bg-text/15" : "hover:bg-text/5"
						} flex gap-2 items-center justify-start text-text/60`}
					>
						<Icon
							name="TbPalette"
							className="text-transparent fill-text/40 text-xl"
						/>
						<span>Profile</span>
					</a>
					<a
						onClick={() => setPage(2)}
						className={`cursor-pointer px-2 py-1 rounded-lg transition-all duration-300 ${
							page === 2 ? "bg-text/10 hover:bg-text/15" : "hover:bg-text/5"
						} flex gap-2 items-center justify-start text-text/60`}
					>
						<Icon name="TbAdjustments" className="text-text/40 text-xl" />
						<span>Advanced</span>
					</a>
					<a
						onClick={() => setPage(3)}
						className={`cursor-pointer px-2 py-1 rounded-lg transition-all duration-300 ${
							page === 3 ? "bg-text/10 hover:bg-text/15" : "hover:bg-text/5"
						} flex gap-2 items-center justify-start text-text/60`}
					>
						<Icon
							name="TbUser"
							className="text-transparent fill-text/40 text-xl"
						/>
						<span>Account</span>
					</a>
					<a
						onClick={() => setPage(4)}
						className={`cursor-pointer px-2 py-1 rounded-lg transition-all duration-300 ${
							page === 4 ? "bg-text/10 hover:bg-text/15" : "hover:bg-text/5"
						} flex gap-2 items-center justify-start text-text/60`}
					>
						<Icon name="TbBandageFilled" className="text-text/40 text-xl" />
						<span>Info</span>
					</a>
				</div>
				<div className="h-full w-full flex flex-col gap-2">
					<CurrentPage page={page} />
				</div>
			</div>
		</div>
	);
}
