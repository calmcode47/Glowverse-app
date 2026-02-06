module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
          alias: {
            "@components": "./src/components",
            "@navigation": "./src/navigation",
            "@screens": "./src/screens",
            "@services": "./src/services",
            "@hooks": "./src/hooks",
            "@context": "./src/context",
            "@utils": "./src/utils",
            "@constants": "./src/constants",
            "@assets": "./src/assets"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};
