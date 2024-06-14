import Icon from "./Icon";

export default function ContextMenu({ x, y, exit, elements }) {
	return (
		<div
			onMouseLeave={() => (exit ? exit() : {})}
			style={{ top: y, left: x }}
			className="fixed z-[100] w-fit rounded-lg border border-text/10 border-opacity-10 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-md"
		>
			{elements.map((element) => (
				<a
					key={element.name}
					onClick={() => {
						element.action();
						exit();
					}}
					className="cursor-pointer m-1 w-64 hover:primary/40 opacity-60 hover:backdrop-blur-3xl transition-all duration-200 py-1 px-3 rounded-lg flex items-center justify-start gap-2"
				>
					<Icon
						name={element.icon}
						className="text-transparent fill-text/20 scale-125"
					/>
					{element.name}
				</a>
			))}
		</div>
	);
}
