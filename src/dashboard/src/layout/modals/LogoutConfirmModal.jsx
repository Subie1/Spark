import { useContext } from "react";
import Icon from "../components/Icon";
import { context } from "../../lib/Context";

export default function LogoutConfirmModal() {
	const { _setToken, setModal } = useContext(context);

	return (
		<div className="py-2 flex flex-col gap-4 w-full h-full">
			<header className="flex gap-20 items-center justify-between text-3xl px-4 pb-2 border-b border-b-text/10">
				Logout Confirmation
				<a
					onClick={() => setModal(false)}
					className="text-sm text-text/40 p-2 cursor-pointer"
				>
					<Icon name="TbX" />
				</a>
			</header>
			<div className="flex flex-col px-4">
				<span className="text-sm text-text/80">
					Are you sure you want to logout?
				</span>
				<span className="italic text-xs text-text/40">
					If you forgot your password you won&apos;t be able to re-login
				</span>
			</div>
			<div className="px-4 flex gap-2 items-center justify-center w-full">
				<button
					onClick={() => setModal(false)}
					className="px-4 py-2 bg-text/5 rounded-xl"
				>
					Cancel
				</button>
				<button
					type="submit"
					onClick={() => {
						setModal(false);
						_setToken(false);
						window.location.reload();
					}}
					className="px-4 py-2 bg-gradient-to-br from-primary/40 to-accent/40 rounded-xl"
				>
					Logout
				</button>
			</div>
		</div>
	);
}
