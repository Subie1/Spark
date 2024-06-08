import { useContext } from "react";
import { context } from "../../lib/Context";

export default function Modal({ children }) {
	const { setModal } = useContext(context);

	return (
		<div
			onClick={(event) =>
				event.currentTarget === event.target ? setModal(false) : ""
			}
			className="z-50 fixed flex items-center justify-center bg-black/40 w-full h-full"
		>
			<div
				className="drop-shadow-lg backdrop-blur-sm flex flex-col rounded-xl bg-background/60 border border-text/10"
			>
				{children}
			</div>
		</div>
	);
}
