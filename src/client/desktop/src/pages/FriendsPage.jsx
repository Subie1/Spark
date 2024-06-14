import { useContext, useEffect, useState } from "react";
import { context } from "../lib/Context";
import Icon from "../layout/components/Icon";
import axios from "axios";
import AddFriendModal from "../layout/modals/AddFriendModal";

export default function FriendsPage() {
	const [reload, setReload] = useState(0);
	const [rendered, setRendered] = useState({ friends: [], pending: [] });

	const { host, modal, setModal, setDM, setPage } = useContext(context);

	async function acceptRequest(id) {
		await axios.post(`${host}/api/users/friends/accept`, { id });
		setReload(Math.random());
	}

	async function declineRequest(id) {
		await axios.post(`${host}/api/users/friends/decline`, { id });
		setReload(Math.random());
	}

	useEffect(() => {
		axios.get(`${host}/api/users/friends`).then(async ({ data }) => {
			const result = [];
			for (const friend of data.friends) {
				const { data: user } = await axios.get(
					`${host}/api/users/friends/${friend}`
				);
				result.push(user);
			}

			setRendered((previous) => {
				return { ...previous, friends: result };
			});

			axios.get(`${host}/api/users/me`).then(async ({ data }) => {
				const result = [];
				for (const friend of data.pending) {
					const { data: user } = await axios.get(`${host}/api/users/${friend}`);
					result.push(user);
				}

				setRendered((previous) => {
					return { ...previous, pending: result };
				});
			});
		});
	}, [reload, modal]);

	return (
		<main className="w-full h-full flex flex-col overflow-hidden">
			<nav className="flex items-center justify-between px-4 py-4 border-b border-b-text/10 text-text/60">
				<div className="flex gap-2 items-center justify-start">
					<header>Friends</header>
					<Icon name="TbChevronRight" className="text-text/20" />

					<div className="flex items-center justify-center gap-1">
						<div className="p-1 bg-gradient-to-br from-primary to-accent rounded-lg">
							<Icon name="TbHeart" className="text-transparent fill-text/60" />
						</div>
						<header>All</header>
					</div>
				</div>
				<button
					onClick={() => setModal(<AddFriendModal />)}
					className="flex items-center justify-center gap-2 transition-all duration-300 hover:bg-secondary/60 bg-gradient-to-br from-primary/60 to-accent/60 rounded-xl px-3 py-2 text-xs text-text/80"
				>
					<Icon name="TbPlus" className="text-xs" />
					Add Friend
				</button>
			</nav>
			{
				<div className="w-full gap-2 p-2 h-full relative text-text/40 flex items-center justify-center overflow-hidden">
					<div className="flex flex-col flex-1 py-2 h-full overflow-hidden">
						<header className="px-2 text-text/80 text-center">
							Online{" "}
							{rendered.friends.length
								? `- ${
										rendered.friends.filter(
											(friend) =>
												friend.status == "online" || friend.status == "idle"
										).length
								  }`
								: ""}
						</header>
						<hr className="my-2 border-text/20" />
						<div className="flex flex-col gap-1 p-2 overflow-y-auto">
							{rendered.friends.length
								? rendered.friends
										.filter(
											(friend) =>
												friend.status == "online" || friend.status == "idle"
										)
										.map((friend) => (
											<div key={friend.friend}>
												<div className="flex items-center justify-between w-full">
													<a
														onClick={() => {
															setDM({
																token: friend.messages,
																friend: friend.name,
															});

															setPage(2);
														}}
														className="cursor-pointer flex items-center justify-start gap-2"
													>
														<img
															src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${friend.id}`}
															className="w-8 h-8 rounded-full"
														/>
														<div className="flex-col flex">
															<div className="flex items-center justify-start gap-2">
																<header className="text-text/80">
																	{friend.username}
																</header>
																<div
																	className={`${
																		friend.status === "online"
																			? "bg-green-500"
																			: "bg-orange-500"
																	} w-2 h-2 rounded-full`}
																></div>
															</div>
															<div className="text-xs text-text/20 flex items-center justify-start gap-2">
																{friend.first ? (
																	<div className="text-text/60 px-2 py-1 rounded-md bg-gradient-to-br from-primary/60 to-accent/60">
																		First
																	</div>
																) : (
																	""
																)}
																<span>
																	Friends since{" "}
																	{`${
																		new Date(friend.added_timestamp).getDay() +
																		1
																	}/${
																		new Date(
																			friend.added_timestamp
																		).getMonth() + 1
																	}/${new Date(
																		friend.added_timestamp
																	).getFullYear()}`}
																</span>
															</div>
														</div>
													</a>
													<a className="pl-2 cursor-pointer">
														<Icon name="TbMenu" />
													</a>
												</div>
											</div>
										))
								: ""}
						</div>
					</div>
					<div className="flex-1 py-2 h-full overflow-hidden">
						<header className="px-2 text-text/80 text-center">Offline</header>
						<hr className="my-2 border-text/20" />
						<div className="flex flex-col gap-1 p-2 overflow-y-auto">
							{rendered.friends.length
								? rendered.friends
										.filter((friend) => friend.status == "offline")
										.map((friend) => (
											<div key={friend.friend}>
												<div className="flex items-center justify-between w-full">
													<a
														onClick={() => {
															setDM({
																token: friend.messages,
																friend: friend.name,
															});

															setPage(2);
														}}
														className="cursor-pointer flex items-center justify-start gap-2"
													>
														<img
															src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${friend.id}`}
															className="w-8 h-8 rounded-full"
														/>
														<div className="flex-col flex">
															<div className="flex items-center justify-start gap-2">
																<header className="text-text/80">
																	{friend.username}
																</header>
																<div className="bg-gray-200 w-2 h-2 rounded-full"></div>
															</div>
															<div className="text-xs text-text/20 flex items-center justify-start gap-2">
																<div>
																	{friend.first ? (
																		<div className="px-2 py-1 rounded-md bg-gradient-to-br from-primary/60 to-accent/60">
																			First
																		</div>
																	) : (
																		""
																	)}
																</div>
																<span>
																	Friends since{" "}
																	{`${
																		new Date(friend.added_timestamp).getDay() +
																		1
																	}/${
																		new Date(
																			friend.added_timestamp
																		).getMonth() + 1
																	}/${new Date(
																		friend.added_timestamp
																	).getFullYear()}`}
																</span>
															</div>
														</div>
													</a>
													<a className="pl-2 cursor-pointer">
														<Icon name="TbMenu" />
													</a>
												</div>
											</div>
										))
								: ""}
						</div>
					</div>
					<div className="flex-1 py-2 h-full overflow-hidden">
						<header className="px-2 text-text/80 text-center">Requests</header>
						<hr className="my-2 border-text/20" />
						<div className="flex flex-col gap-1 p-2 overflow-y-auto">
							{rendered.pending.length ? (
								rendered.pending.map((pending) => (
									<div key={pending.id} className="w-full p-2">
										<div className="flex items-start justify-between gap-2 w-full">
											<div className="flex items-center justify-center gap-2">
												<img
													src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${pending.id}`}
													className="w-8 h-8 rounded-full"
												/>
												<div className="flex-col flex">
													<div className="flex items-center justify-start gap-2">
														<header className="text-text/80">
															{pending.username}
														</header>
														<div className="bg-gray-200 w-2 h-2 rounded-full"></div>
													</div>
												</div>
											</div>
											<a className="pl-2 cursor-pointer">
												<Icon name="TbMenu" />
											</a>
										</div>
										<div>
											<span className="flex items-center justify-center gap-1 text-xs text-text/80">
												<button
													onClick={() => declineRequest(pending.id)}
													className="px-2 py-1 rounded-lg bg-text/10"
												>
													Decline
												</button>
												<button
													onClick={() => acceptRequest(pending.id)}
													className="px-2 py-1 rounded-lg bg-gradient-to-br from-primary/60 to-accent/60"
												>
													Accept
												</button>
											</span>
										</div>
									</div>
								))
							) : (
								<div>
									<header>There seems to be no pending friend requests</header>
								</div>
							)}
						</div>
					</div>
				</div>
			}
		</main>
	);
}
