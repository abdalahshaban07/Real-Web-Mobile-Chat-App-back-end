const helper = {};

helper.firstUpper = (username) => {
	const name = username.toLowerCase();
	return name.charAt(0).toUpperCase() + name.slice(1);
};

helper.lowerCase = (str) => {
	return str.toLowerCase();
};

module.exports = helper;
