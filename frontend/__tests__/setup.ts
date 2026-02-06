import "@testing-library/jest-native/extend-expect";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { jest } = require("@jest/globals");

jest.mock("@react-native-async-storage/async-storage", () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => store[k] ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        store[k] = v;
      }),
      removeItem: jest.fn(async (k: string) => {
        delete store[k];
      }),
      clear: jest.fn(async () => {
        store = {};
      })
    }
  };
});

jest.mock("expo-camera", () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
    getCameraPermissionsAsync: jest.fn(async () => ({ status: "granted" }))
  }
}));

jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" }))
}));

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} })
  };
});

jest.mock("@services/api/client", () => {
  return {
    __esModule: true,
    client: {
      post: jest.fn(async () => ({ data: { imageId: "img1", uri: "mock://image", format: "jpeg", sizeBytes: 123 } })),
      get: jest.fn(async () => ({ data: { items: [{ id: "p1", name: "Prod", category: "lipstick" }] } })),
      request: jest.fn(async (cfg: any) => ({ data: cfg }))
    }
  };
});

jest.mock("@utils/imageProcessor", () => ({
  validateImage: jest.fn(async () => true),
  compressImage: jest.fn(async (uri: string) => uri)
}));
