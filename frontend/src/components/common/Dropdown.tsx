import React from "react";
import { View, StyleSheet } from "react-native";
import { Menu, TextInput, List, Checkbox, useTheme, Searchbar } from "react-native-paper";

export type DropdownItem<T = string> = {
  label: string;
  value: T;
};

type Props<T = string> = {
  label?: string;
  placeholder?: string;
  items: DropdownItem<T>[];
  search?: boolean;
  multiple?: boolean;
  selected?: T | T[] | null;
  onChange: (val: T | T[] | null) => void;
  renderItem?: (item: DropdownItem<T>, isSelected: boolean) => React.ReactNode;
};

export default function Dropdown<T = string>({
  label,
  placeholder,
  items,
  search = true,
  multiple = false,
  selected = multiple ? ([] as T[]) : (null as T | null),
  onChange,
  renderItem
}: Props<T>) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const anchorRef = React.useRef<View>(null);

  const filtered = React.useMemo(() => {
    if (!search || !query) return items;
    return items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  }, [items, search, query]);

  const isSelected = (val: T) => {
    return multiple ? (selected as T[]).some((v) => v === val) : selected === val;
  };

  const toggleValue = (val: T) => {
    if (multiple) {
      const arr = selected as T[];
      const next = isSelected(val) ? arr.filter((v) => v !== val) : [...arr, val];
      onChange(next);
    } else {
      onChange(val);
      setOpen(false);
    }
  };

  return (
    <View>
      <View ref={anchorRef} collapsable={false}>
        <TextInput
          label={label}
          placeholder={placeholder}
          value={
            multiple
              ? (selected as T[]).map((v) => items.find((i) => i.value === v)?.label || "").join(", ")
              : (items.find((i) => i.value === (selected as T | null))?.label || "")
          }
          onFocus={() => setOpen(true)}
          right={
            ((props: { size: number; color: string }) => (
              <List.Icon icon={open ? "chevron-up" : "chevron-down"} />
            )) as any
          }
          editable={false}
        />
      </View>
      <Menu visible={open} onDismiss={() => setOpen(false)} anchor={<View />} contentStyle={{ width: "100%" }}>
        {search ? (
          <View style={{ paddingHorizontal: 8 }}>
            <Searchbar placeholder="Search" value={query} onChangeText={setQuery} />
          </View>
        ) : null}
        {filtered.map((item) =>
          renderItem ? (
            <View key={String(item.value)} onTouchEnd={() => toggleValue(item.value)}>
              {renderItem(item, isSelected(item.value))}
            </View>
          ) : (
            <Menu.Item
              key={String(item.value)}
              title={item.label}
              onPress={() => toggleValue(item.value)}
              leadingIcon={
                multiple
                  ? (() => (
                      <Checkbox status={isSelected(item.value) ? "checked" : "unchecked"} />
                    )) as any
                  : undefined
              }
            />
          )
        )}
      </Menu>
    </View>
  );
}
