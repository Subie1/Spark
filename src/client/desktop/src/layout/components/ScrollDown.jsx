import { useEffect, useState } from "react";
import Icon from "./Icon";

export default function ScrollDown({ element }) {
	const [isActive, setActive] = useState(false);

	function scrollTo(element, to, duration) {
		if (duration <= 0) return;
		const difference = to - element.scrollTop;
		const perTick = (difference / duration) * 10;

		setTimeout(function () {
			element.scrollTop = element.scrollTop + perTick;
			if (element.scrollTop === to) return;

			scrollTo(element, to, duration - 10);
		}, 10);
	}

	function scroll() {
		if (!element.current) return;
		if (element.current.scrollTop / element.current.scrollHeight > 0.5)
			return setActive(false);

		setActive(true);
	}

	useEffect(() => {
		if (!element.current) return;

		element.current.addEventListener("scroll", scroll);

		return () => {
			if (!element.current) return;
			element.current.removeEventListener("scroll", scroll);
		};
	}, [element.current]);

	return isActive ? (
		<a
			onClick={() =>
				element.current
					? scrollTo(element.current, element.current.scrollHeight, 350)
					: ""
			}
			className="transition-all duration-300 cursor-pointer hover:scale-110 flex p-2 rounded-full absolute right-4 bottom-[70px] items-center justify-center bg-background"
		>
			<Icon name="TbChevronDown" />
		</a>
	) : (
		""
	);
}
