import React from "react";
let NetInfo: any = null;
try {
  NetInfo = require("@react-native-community/netinfo");
} catch {}

export function useNetworkStatus() {
  const [online, setOnline] = React.useState(true);
  React.useEffect(() => {
    if (!NetInfo?.addEventListener) return;
    const unsub = NetInfo.addEventListener((state: any) => {
      setOnline(Boolean(state?.isConnected));
    });
    NetInfo.fetch?.().then((state: any) => setOnline(Boolean(state?.isConnected)));
    return () => unsub?.();
  }, []);
  return { online };
}
