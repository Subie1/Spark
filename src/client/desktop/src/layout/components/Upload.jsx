import { useState } from "react";
import Icon from "./Icon";
import { motion } from "framer-motion";

export default function Upload() {
	const [open, setOpen] = useState(false);

	return (
		<div className="p-2 text-text/30">
			<a onClick={() => setOpen(!open)} className="cursor-pointer">
				<Icon name="TbPaperclip" className="text-xl" />
			</a>
			<motion.div
				initial={{ scale: 0 }}
				animate={open ? "open" : "closed"}
				variants={{
					open: {
						scale: 1,
					},
					closed: {
						scale: 0,
					},
				}}
				onMouseLeave={() => setOpen(false)}
				className="flex flex-col divide-y divide-text/10 bottom-14 left-0 bg-background border border-text/10 items-start justify-center absolute w-56 rounded-xl"
			>
				<div className="cursor-pointer first:rounded-t-xl last:rounded-b-xl hover:bg-text/5 transition-all duration-300 px-4 py-2 w-full flex gap-2 items-center justify-between">
					<span className="text-sm">Upload File</span>
					<Icon
						name="TbSwipe"
						className="text-2xl text-transparent fill-text/20"
					/>
				</div>
				<div className="cursor-pointer first:rounded-t-xl last:rounded-b-xl hover:bg-text/5 transition-all duration-300 px-4 py-2 w-full flex gap-2 items-center justify-between">
					<span className="text-sm">Invite</span>
					<Icon
						name="TbSwipe"
						className="text-2xl text-transparent fill-text/20"
					/>
				</div>
			</motion.div>
		</div>
	);
}
