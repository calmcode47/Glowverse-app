import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { focusManagement } from "../utils/focusManagement";

export function usePageAnnouncement(screenName: string, announcement?: string) {
  const navigation = useNavigation();
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      const msg = announcement || `${screenName} screen`;
      setTimeout(() => {
        focusManagement.announce(msg);
      }, 100);
    });
    return unsub;
  }, [navigation, screenName, announcement]);
}
