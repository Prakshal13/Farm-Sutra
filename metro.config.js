const fs = require("fs");

// --- REACT 19 METRO PATCH ---
// Dynamically patches React's package.json to expose the 'cjs' folder 
// so Metro's HasteMap will officially watch and index it.
try {
  const reactPkgPath = require.resolve("react/package.json");
  const reactPkg = JSON.parse(fs.readFileSync(reactPkgPath, "utf8"));
  if (reactPkg.exports && !reactPkg.exports["./cjs/*"]) {
    reactPkg.exports["./cjs/*"] = "./cjs/*";
    fs.writeFileSync(reactPkgPath, JSON.stringify(reactPkg, null, 2));
  }
} catch (e) { }
// --- END PATCH ---

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Strictly required for React Navigation v7 web imports
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: "./src/global.css" });