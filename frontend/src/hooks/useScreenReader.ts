import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useScreenReader() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const e = await AccessibilityInfo.isScreenReaderEnabled();
        if (mounted) setEnabled(e);
      } catch {}
    })();
    const sub = AccessibilityInfo.addEventListener("screenReaderChanged", (e: boolean) => {
      setEnabled(e);
    });
    return () => {
      mounted = false;
      // @ts-ignore RN 0.81 remove API
      sub?.remove?.();
    };
  }, []);
  return enabled;
}
