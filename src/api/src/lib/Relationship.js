const relationships = MainStorage.box("relationships");

module.exports = (token) => {
	const keys = [...Array.from(relationships.keys())];
	for (const key of keys) {
		if (key === "default") continue;
		const query = relationships
			.get(key)
			.filter((ship) => ship.messages === token);
		if (!query.length) continue;
		return { owner: key, ...query[0] };
	}

	return null;
};
