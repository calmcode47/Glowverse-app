const dotenv = require('dotenv');
dotenv.config();

module.exports = ({ config }) => {
  const dev = process.env.API_BASE_URL_DEV || 'http://192.168.1.8:5000/api/v1';
  const prod = process.env.API_BASE_URL_PROD || 'https://your-api.railway.app/api/v1';
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      apiBaseUrlDev: dev,
      apiBaseUrlProd: prod
    }
  };
};
