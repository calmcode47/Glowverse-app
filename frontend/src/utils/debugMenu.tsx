import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, Dialog, Portal, TextInput, Switch, useTheme } from "react-native-paper";
import { clearStorage, saveToStorage, getFromStorage } from "@utils/storage";
import { useApp } from "@context/AppContext";

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export default function DebugMenu({ visible, onDismiss }: Props) {
  if (!__DEV__) return null as any;
  const theme = useTheme();
  const { setOnboardingComplete } = useApp();
  const [apiBase, setApiBase] = React.useState<string>("");
  const [experimentalAR, setExperimentalAR] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      const base = await getFromStorage<string>("apiBaseUrl");
      setApiBase(base || "");
      const exp = await getFromStorage<boolean>("experimentalAR");
      setExperimentalAR(Boolean(exp));
    })();
  }, []);

  const saveApiBase = async () => {
    await saveToStorage("apiBaseUrl", apiBase);
  };
  const toggleAR = async () => {
    const next = !experimentalAR;
    setExperimentalAR(next);
    await saveToStorage("experimentalAR", next);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Debug Menu</Dialog.Title>
        <Dialog.Content>
          <View style={styles.row}>
            <Text>Experimental AR</Text>
            <Switch value={experimentalAR} onValueChange={toggleAR} />
          </View>
          <TextInput label="API Base URL" value={apiBase} onChangeText={setApiBase} />
          <View style={styles.row}>
            <Button onPress={saveApiBase}>Save API</Button>
            <Button onPress={async () => { await clearStorage(); }}>Clear Cache</Button>
          </View>
          <View style={styles.row}>
            <Button onPress={async () => { await setOnboardingComplete(false); }}>Reset Onboarding</Button>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 8 }
});
