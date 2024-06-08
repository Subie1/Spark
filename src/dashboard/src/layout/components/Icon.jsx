import { useState } from "react";
import * as Icons from "react-icons/tb";

export default function Icon({ name, hover, className }) {
	const [isOver, setOver] = useState(false);

	const Response = isOver
		? Icons[hover] ?? Icons[name] ?? Icons.TbError404
		: Icons[name] ?? Icons.TbError404;
	return (
		<Response
			onMouseOver={() => setOver(true)}
			onMouseLeave={() => setOver(false)}
			className={className ?? ""}
		/>
	);
}
