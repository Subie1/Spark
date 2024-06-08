const users = MainStorage.box("users");

module.exports = (token) => {
    const members = [...Array.from(users.values())];
    for (const member of members) if (member.token === token) return member;
    return null;
}

module.exports.fromName = (name) => {
	const members = [...Array.from(users.values())];
	for (const member of members) if (member.name === name) return member;
	return null;
};

module.exports.fromID = (id) => {
    if (users.has(id)) return users.get(id);
    return null;
}