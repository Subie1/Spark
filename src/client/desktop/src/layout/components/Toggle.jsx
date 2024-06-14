import { useEffect, useRef } from "react";

export default function Toggle({ defaultValue, onChange, width, height }) {
	const input = useRef(null);

	useEffect(() => {
		if (!input.current) return;
		input.current.checked = defaultValue;
	}, [input.current]);

	return (
		<div className="relative w-fit h-fit group cursor-pointer">
			<input
				ref={input}
				onChange={(event) => (onChange ? onChange(event.target.checked) : "")}
				type="checkbox"
				className="absolute w-full cursor-pointer appearance-none z-20 h-full peer rounded-md"
			/>
			<span
				style={{ width: width ?? "32px", height: height ?? "16px" }}
				className="flex items-center p-[2px] bg-text/10 rounded-full duration-300 ease-in-out peer-checked:bg-accent after:h-full after:aspect-square after:bg-text/20 after:rounded-full after:shadow-md after:duration-300 peer-checked:after:bg-background/60 peer-checked:after:translate-x-[14px] group-hover:bg-text/15 group-hover:after:translate-x-[10%]"
			></span>
		</div>
	);
}
