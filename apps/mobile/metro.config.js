const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve native-only modules to web stubs when bundling for web
const WEB_STUBS = {
  'react-native-maps': path.resolve(__dirname, 'src/mocks/react-native-maps.web.tsx'),
  'expo-secure-store': path.resolve(__dirname, 'src/mocks/expo-secure-store.web.ts'),
};

const originalResolveRequest = config.resolver?.resolveRequest;
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && WEB_STUBS[moduleName]) {
      return {
        filePath: WEB_STUBS[moduleName],
        type: 'sourceFile',
      };
    }
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
