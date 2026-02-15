const RNFBAppModule = {
  initializeApp: async () => {},
  deleteApp: async () => {},
  setLogLevel: (_: string) => {},
  metaGetAll: async () => ({}),
  jsonGetAll: async () => ({}),
  preferencesClearAll: async () => {},
  preferencesGetAll: async () => ({}),
  preferencesSetBool: async () => {},
  preferencesSetString: async () => {},
  setAutomaticDataCollectionEnabled: () => {},
};

export default {
  native: RNFBAppModule,
  app: () => ({ options: {}, name: "default" }),
};

