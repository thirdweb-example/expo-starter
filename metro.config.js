// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// thirdweb config
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
	"react-native",
	"browser",
	"require",
];

module.exports = config;
