import { v2 as cloudinary } from "cloudinary";
import env from "@config/env";

try {
  cloudinary.config({
    cloud_name: 'Root',
    api_key: '692916251973828',
    api_secret: 'aY_dT-pzcNLm47_v1SzmCtUJfeQ',
    secure: true
  });
} catch (error) {
  console.warn('Cloudinary config failed - using mock values for tests');
  // For test environments, use mock values if cloudinary is available
  if (cloudinary && cloudinary.config) {
    cloudinary.config({
      cloud_name: 'test',
      api_key: 'test_key',
      api_secret: 'test_secret',
      secure: true
    });
  }
}

export default cloudinary;
