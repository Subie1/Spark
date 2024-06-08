import axios from "axios";
import { HexColorPicker } from "react-colorful";
import { useContext, useEffect, useRef } from "react";
import { context } from "../../../lib/Context";
import Icon from "../../components/Icon";

export default function ProfileSettings() {
	const input = useRef(null);
	const { host, rgb, setRGB } = useContext(context);

	useEffect(() => {
		axios.get(`${host}/api/users/me/settings`).then(async ({ data }) => {
			setRGB(data.ring.value);
		});
	}, []);

	useEffect(() => {
		if (!rgb) return;
		axios.put(`${host}/api/users/me/settings/modify/ring`, { value: rgb });
	}, [rgb]);

	return (
		<main className="h-full w-96 flex flex-col gap-2 text-text/60">
			<div className="flex flex-col w-full gap-2">
				<header className="text-md text-text/90">Profile</header>
				<div className="w-full h-full flex flex-col gap-1">
					<div className="flex w-full items-center justify-between">
						<span className="text-sm">Ring Color</span>
						<div className="pr-6 relative group">
							<input
								ref={input}
								type="checkbox"
								className="cursor-pointer absolute w-full h-full peer appearance-none rounded-md"
							/>
							<Icon name="TbArrowUpRight" />
							<div
								onMouseLeave={() =>
									input.current ? (input.current.checked = false) : ""
								}
								className="absolute hidden peer-checked:flex picker-modal"
							>
								<HexColorPicker
									color={rgb}
									onChange={(color) => setRGB(color)}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
