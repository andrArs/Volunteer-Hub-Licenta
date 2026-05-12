const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const originalResolver = config.resolver?.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // react-native-svg filter components (FeBlend, FeColorMatrix, etc.) require
  // Fabric codegen which doesn't run in Expo Go. Stub them out since they're
  // not used by react-native-qrcode-svg.
  if (/\/fabric\/Fe\w+NativeComponent/.test(moduleName)) {
    return { type: "empty" };
  }
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
