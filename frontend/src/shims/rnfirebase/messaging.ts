function createNoop() {}

function messaging() {
  return {
    requestPermission: async () => ({ authorized: false }),
    getToken: async () => null,
    onMessage: (_cb: any) => createNoop,
    onNotificationOpenedApp: (_cb: any) => {},
    getInitialNotification: async () => null,
    setBackgroundMessageHandler: (_cb: any) => {},
    isDeviceRegisteredForRemoteMessages: async () => false,
    registerDeviceForRemoteMessages: async () => {},
    unregisterDeviceForRemoteMessages: async () => {},
    subscribeToTopic: async (_topic: string) => {},
    unsubscribeFromTopic: async (_topic: string) => {},
    AuthorizationStatus: {
      AUTHORIZED: 1,
      PROVISIONAL: 2,
    },
  };
}

export default messaging;

