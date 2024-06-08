import { useState } from "react";
import Icon from "./Icon";

export default function Upload() {
	const [open, setOpen] = useState(false);

	return (
		<div className="p-2 relative text-text/30">
			<a onClick={() => setOpen(!open)} className="cursor-pointer">
				<Icon name="TbPaperclip" className="text-xl" />
			</a>
			{open ? (
				<div
					onMouseLeave={() => setOpen(false)}
					className="flex flex-col divide-y divide-text/10 bottom-12 left-0 bg-background border border-text/20 items-start justify-center absolute w-56 rounded-xl"
				>
					<div className="cursor-pointer first:rounded-t-xl last:rounded-b-xl hover:bg-text/5 transition-all duration-300 px-4 py-2 w-full flex gap-2 items-center justify-between">
						<span className="text-sm">Photo</span>
						<Icon
							name="TbPhoto"
							className="text-2xl text-transparent fill-text/20"
						/>
					</div>
					<div className="cursor-pointer first:rounded-t-xl last:rounded-b-xl hover:bg-text/5 transition-all duration-300 px-4 py-2 w-full flex gap-2 items-center justify-between">
						<span className="text-sm">Document</span>
						<Icon
							name="TbFile"
							className="text-2xl text-transparent fill-text/20"
						/>
					</div>
					<div className="cursor-pointer first:rounded-t-xl last:rounded-b-xl hover:bg-text/5 transition-all duration-300 px-4 py-2 w-full flex gap-2 items-center justify-between">
						<span className="text-sm">Camera</span>
						<Icon
							name="TbCamera"
							className="text-2xl text-transparent fill-text/20"
						/>
					</div>
				</div>
			) : (
				""
			)}
		</div>
	);
}
