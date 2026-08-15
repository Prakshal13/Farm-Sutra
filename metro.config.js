const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// EXPLICITLY force Metro to recognize and resolve .css files
if (!config.resolver.sourceExts.includes("css")) {
  config.resolver.sourceExts.push("css");
}

module.exports = withNativeWind(config, { input: "./src/global.css" });