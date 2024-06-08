import { useContext, useEffect, useState } from "react";
import Icon from "../components/Icon";
import { context } from "../../lib/Context";
import axios from "axios";

function CustomOption({ options, setOptions }) {
	const { host, groups, setGroups, setModal } = useContext(context);
	const [channels, setChannels] = useState([]);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!error) return;
		setTimeout(() => setError(false), 5_000);
	}, [error]);

	useEffect(() => {
		if (!options) return;
		setChannels(options.channels);
	}, [options]);

	function remove(channel) {
		const copy = { ...options };
		copy.channels = copy.channels.filter((c) => c !== channel);
		setOptions(copy);
	}

	async function submit(event) {
		event.preventDefault(true);

		const inputs = document.querySelectorAll("#form_data input");
		const query = {};
		for (const input of inputs) {
			query[input.name] = input.value;
		}

		if (!query.name)
			return setError("Name field is required when adding a channel");
		if (!query.name.trim().length)
			return setError("Name field is required when adding a channel");

		const copy = { ...options };
		copy.channels.push(query.name);

		setOptions(copy);
		setOpen(false);
	}

	async function create() {
		if (!channels.length)
			return setError("Minimum amount of channels needed is 1");
		if (!options.name) return setError("Group name is a required field");
		if (!options.name.trim().length)
			return setError("Group name is a required field");

		try {
			const { data } = await axios.post(
				`${host}/api/groups/create`,
				options
			);

			const copy = [ ...groups ];
			copy.push(data.id);

			setGroups(copy);
			setModal(false);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className="w-full flex flex-col gap-2 items-start justify-start">
			<a
				onClick={() => setOpen(true)}
				className="w-full text-text/60 relative cursor-pointer flex items-center justify-center gap-2"
			>
				<span className="text-xs">Add a channel</span>
				<Icon name="TbPlus" />

				<form
					id="form_data"
					onSubmit={submit}
					onMouseLeave={() => setOpen(false)}
					className={`bg-background gap-2 left-[50%] translate-x-[-50%] border border-text/10 scale-75 w-full absolute p-2 rounded-lg items-center justify-center ${
						open ? "flex" : "hidden"
					}`}
				>
					<span className="uppercase font-bold text-xs ml-1 text-text/30">
						Name
					</span>
					<input
						type="text"
						autoComplete="off"
						name="name"
						className="border border-text/10 px-4 py-3 w-full h-full bg-secondary/5 rounded-lg outline-none placeholder-text/20 text-text/70"
					/>
					<button type="submit"><Icon name="TbCheck" /></button>
				</form>
			</a>
			{channels.map((channel) => (
				<div
					key={channel.toLowerCase()}
					className="w-full flex items-center justify-between"
				>
					<div className="items-center flex gap-2 justify-start text-text transition-all duration-300">
						<Icon name="TbHash" />
						<span>{channel}</span>
					</div>
					<a onClick={() => remove(channel)} className="cursor-pointer">
						<Icon name="TbMinus" />
					</a>
				</div>
			))}
			{error ? (
				<span className="text-red-400 text-xs w-full text-center">{error}</span>
			) : (
				""
			)}
			<div className="w-full flex items-center justify-center">
				<button
					onClick={() => create()}
					className="p-2 gap-2 flex items-center bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text justify-center"
				>
					<span>Create</span>
					<Icon name="TbChevronRight" className="text-accent" />
				</button>
			</div>
		</div>
	);
}

function TemplateOption({ options, setOptions, setCustom }) {
	useEffect(() => {
		if (options.channels.length) setCustom(false);
	}, [options]);

	const templates = [
		{
			name: "Gaming",
			icon: "DeviceGamepad2",
			channels: ["General", "Off-Topic", "Media"],
		},
		{
			name: "Friends",
			icon: "Heart",
			channels: ["Chat", "Memes", "Selfies"],
		},
		{
			name: "Art",
			icon: "Brush",
			channels: ["Chat", "Art-Showcase", "Art-Tips", "WIPs"],
		},
	];

	function change(template) {
		const copy = { ...options };
		copy.channels = template.channels;

		setOptions(copy);
		setCustom(true);
	}

	return (
		<div className="flex flex-col items-center justify-center w-full h-full gap-2">
			{templates.map((template) => (
				<a
					onClick={() => change(template)}
					key={template.name.toLowerCase()}
					className="cursor-pointer flex items-center justify-start gap-2 w-full p-2 rounded-lg border border-text/10"
				>
					<Icon name={`Tb${template.icon}`} className="text-xl filled-text" />
					<span>{template.name}</span>
				</a>
			))}
		</div>
	);
}

export default function GroupCreationModal() {
	const [name, setName] = useState("");
	const [custom, setCustom] = useState(false);
	const { setModal } = useContext(context);

	const [options, setOptions] = useState({ name: "", icon: "", channels: [] });

	useEffect(() => {
		if (!name) return;
		if (!name.trim().length) return;

		const copy = { ...options };
		copy.name = name;

		setOptions(copy);
	}, [name]);

	return (
		<div className="flex flex-col size-full gap-4">
			<header className="py-2 w-full flex gap-20 items-center justify-between text-3xl px-4 pb-2 border-b border-b-text/10">
				<div className="flex flex-col items-start justify-start">
					<span>Create a group</span>
					<span className="text-xs text-text/40">
						Should only take a couple of seconds
					</span>
				</div>
				<a
					onClick={() => setModal(false)}
					className="text-sm hover:text-text/60 transition-all duration-300 text-text/40 p-2 cursor-pointer"
				>
					<Icon name="TbX" />
				</a>
			</header>
			<div className="size-full flex flex-col gap-6">
				<div className="w-full flex flex-col px-2 items-start justify-start">
					<span className="uppercase font-bold text-xs ml-1 text-text/30">
						Group Name
					</span>
					<input
						value={name}
						type="text"
						onChange={(e) => setName(e.target.value)}
						className="px-4 border border-text/10 py-3 w-full h-full bg-secondary/5 rounded-lg outline-none placeholder-text/20 text-text/70"
					/>
				</div>
				<div className="flex flex-col w-full">
					<div className="size-full border-t border-t-text/10 p-3 relative">
						<div className="w-full absolute left-[50%] translate-x-[-50%] -top-5 flex items-center justify-center gap-2">
							<a
								onClick={() => setCustom(true)}
								className={`cursor-pointer p-2 text-xs transition-all duration-300 ${
									custom
										? "border border-text/10 bg-text text-background"
										: "border border-text/10 bg-background"
								} rounded-lg`}
							>
								Custom
							</a>
							<a
								onClick={() => setCustom(false)}
								className={`cursor-pointer p-2 text-xs transition-all duration-300 ${
									custom
										? "border border-text/10 bg-background"
										: "border border-text/10 bg-text text-background"
								} rounded-lg`}
							>
								Templates
							</a>
						</div>
						<div className="size-full p-2">
							{custom ? (
								<CustomOption options={options} setOptions={setOptions} />
							) : (
								<TemplateOption
									setCustom={setCustom}
									options={options}
									setOptions={setOptions}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
