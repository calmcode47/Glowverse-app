module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ts', '.tsx', '.js', '.json'],
          alias: {
            '@': './src',
            '@src': './src',
            '@components': './src/components',
            '@design-system': './src/design-system',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@stores': './src/stores',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@types': './src/types',
            '@assets': './src/assets'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
