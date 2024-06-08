import { useEffect, useState } from "react";
import Icon from "./Icon";

export default function Dropdown({ onChange, values, value, className }) {
	const [currentValue, setCurrentValue] = useState(false);
	const [isOpen, setOpened] = useState(false);

	useEffect(() => {
		setCurrentValue(value);
	}, []);

	useEffect(() => {
		if (!currentValue) return;
		if (onChange) onChange(currentValue);
	}, [currentValue]);

	return (
		<div
			onMouseLeave={() => setOpened(false)}
			onClick={() => setOpened(!isOpen)}
			className={`${className} cursor-pointer relative rounded-xl`}
		>
			<div className="flex gap-2 items-center justify-center">
				<span className="text-sm">
					{currentValue
						? values.filter((v) => v.value === currentValue).length
							? values.filter((v) => v.value === currentValue)[0].name
							: values.filter((v) => v.value === value).length
							? values.filter((v) => v.value === value).length[0].name
							: "Dark"
						: "Dark"}
				</span>
				<Icon name={isOpen ? "TbChevronUp" : "TbChevronDown"} />
			</div>
			<div
				className={`z-30 absolute border border-text/10 p-1 w-56 h-fit ${
					isOpen ? "flex" : "hidden"
				} flex-col rounded-lg bg-background left-0 gap-1`}
			>
				{values.map((value) => (
					<a
						className={`${
							value.value === currentValue
								? "bg-text/10 hover:bg-text/15"
								: "hover:bg-text/5"
						} rounded-lg px-2 py-1 text-md flex items-center gap-2 justify-start text-text/20 cursor-pointer hover:text-text/30 transition-all duration-300`}
						onClick={() => setCurrentValue(value.value)}
						key={value.value}
					>
						{value.name}
					</a>
				))}
			</div>
		</div>
	);
}
