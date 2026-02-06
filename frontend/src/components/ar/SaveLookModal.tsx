import React from "react";
import { View, StyleSheet } from "react-native";
import { Dialog, Portal, TextInput, Button, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  config: { productId?: string; color?: string; intensity?: number };
};

export default function SaveLookModal({ visible, onDismiss, config }: Props) {
  const theme = useTheme();
  const [name, setName] = React.useState("");
  const [note, setNote] = React.useState("");

  const save = async () => {
    const existing = await AsyncStorage.getItem("favoriteLooks");
    const arr = existing ? (JSON.parse(existing) as any[]) : [];
    const entry = { id: `${Date.now()}`, name, note, config, createdAt: new Date().toISOString() };
    await AsyncStorage.setItem("favoriteLooks", JSON.stringify([entry, ...arr]));
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Save Look</Dialog.Title>
        <Dialog.Content>
          <TextInput label="Name" value={name} onChangeText={setName} />
          <TextInput label="Notes" value={note} onChangeText={setNote} />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={save}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
