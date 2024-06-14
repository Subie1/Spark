import { useContext } from "react";
import { context } from "../../lib/Context";
import { motion } from "framer-motion";

export default function Modal({ children }) {
	const { setModal } = useContext(context);

	return (
		<div
			onClick={(event) =>
				event.currentTarget === event.target ? setModal(false) : ""
			}
			className="z-50 fixed flex items-center justify-center bg-black/40 w-full h-full"
		>
			<motion.div
				initial={{ scale: 0.5 }}
				animate={{ scale: 1 }}
				className="drop-shadow-lg backdrop-blur-sm flex flex-col rounded-xl bg-gradient-to-l from-text/5 via-background/20 to-text/5 border border-text/10"
			>
				{children}
			</motion.div>
		</div>
	);
}
