import { useContext, useEffect, useState } from "react";
import { context } from "../lib/Context";

import GroupsPage from "../pages/GroupsPage";
import Sidebar from "./components/Sidebar";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import FriendsPage from "../pages/FriendsPage";
import ContextMenu from "./components/ContextMenu";
import Modal from "./modals/Modal";
import { useIdle } from "@uidotdev/usehooks";
import axios from "axios";
import MessagesPage from "../pages/MessagesPage";

const CurrentPage = () => {
	const { page } = useContext(context);
	if (page === 0) return <GroupsPage />;
	if (page === 1) return <FriendsPage />;
	if (page === 2) return <MessagesPage />;

	if (page === -1) return <LoginPage />;
	if (page === -2) return <RegisterPage />;

	return <GroupsPage />;
};

export default function Layout() {
	const { host, theme, loaded, elements, setElements, modal, token } = useContext(context);

	const idle = useIdle(5 * 60 * 1000);

	const [isContext, setIsContext] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });

	function HandleContextMenu(event) {
		event.preventDefault();

		const x = event.pageX - 10 + "px";
		const y = event.pageY - 10 + "px";

		setPosition({ x, y });
		setIsContext(true);
	}

	useEffect(() => {
		if (!token) return;
		axios.put(`${host}/api/users/me/idle`, { is_idle: `${idle}` });
	}, [idle])

	return (
		<main
			onContextMenu={HandleContextMenu}
			className={`${theme} flex items-center justify-center w-full h-full bg-background/95 text-text`}
		>
			{modal ? <Modal>{modal}</Modal> : ""}
			{isContext ? (
				<ContextMenu
					elements={elements}
					exit={() => {
						setIsContext(false);
						setElements([]);
					}}
					x={position.x}
					y={position.y}
				/>
			) : (
				""
			)}
			{loaded ? <Sidebar /> : ""}
			<div
				className={`w-full h-[calc(100%-20px)] overflow-hidden ${
					loaded ? "rounded-l-xl border border-text/10 border-r-transparent" : ""
				}`}
			>
				<CurrentPage />
			</div>
		</main>
	);
}
