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

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} })
}));

jest.mock("expo-secure-store", () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    getItemAsync: jest.fn(async (k: string) => store[k] ?? null),
    deleteItemAsync: jest.fn(async (k: string) => {
      delete store[k];
    })
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const Icon = ({ name, size, color }: any) => React.createElement(Text, { accessibilityLabel: `icon-${name}` }, "");
  return { MaterialCommunityIcons: Icon, Ionicons: Icon, Feather: Icon, FontAwesome: Icon };
}, { virtual: true });

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => () => {}),
    fetch: jest.fn(async () => ({ isConnected: true }))
  }
}));

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
