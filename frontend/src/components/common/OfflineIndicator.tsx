import React from "react";
import { StyleSheet, Text } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { Banner } from "react-native-paper";
import { offlineQueue } from "../../services/offlineQueue.service";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = React.useState(false);
  const [queueSize, setQueueSize] = React.useState(0);

  React.useEffect(() => {
    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      const off = !state.isConnected;
      setIsOffline(off);
      if (!off) {
        offlineQueue.processQueue();
      }
    });
    const interval = setInterval(() => {
      setQueueSize(offlineQueue.getQueueSize());
    }, 1000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  if (!isOffline && queueSize === 0) return null;

  return (
    <Banner
      visible
      icon={isOffline ? "wifi-off" : "sync"}
      style={[styles.banner, isOffline ? styles.offlineBanner : styles.syncingBanner]}
    >
      <Text style={styles.text}>
        {isOffline ? "You're offline. Changes will sync when reconnected." : `Syncing ${queueSize} pending ${queueSize === 1 ? "change" : "changes"}...`}
      </Text>
    </Banner>
  );
}

const styles = StyleSheet.create({
  banner: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 },
  offlineBanner: { backgroundColor: "#FF9800" },
  syncingBanner: { backgroundColor: "#4CAF50" },
  text: { color: "#FFFFFF", fontSize: 14 }
});

