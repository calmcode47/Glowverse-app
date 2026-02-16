import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Step = "placed" | "payment_confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered";

type Props = {
  current: Step;
  timestamps?: Partial<Record<Step, string>>;
};

const steps: Step[] = ["placed", "payment_confirmed", "processing", "shipped", "out_for_delivery", "delivered"];

export default function OrderStatusTimeline({ current, timestamps = {} }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const currentIdx = steps.indexOf(current);

  return (
    <View style={styles.container}>
      {steps.map((s, i) => {
        const active = i <= currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <View key={s} style={styles.step}>
            <View style={[styles.dot, active && styles.dotActive, isCurrent && styles.dotCurrent]}>
              <Text style={[styles.icon, active && styles.iconActive]}>{getIcon(s)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.label, active && styles.labelActive, isCurrent && styles.labelCurrent]}>
                {label(s)}
              </Text>
              {timestamps[s] ? (
                <Text style={styles.time}>{shortDate(timestamps[s]!)}</Text>
              ) : null}
            </View>
            {i < steps.length - 1 ? (
              <View style={[styles.bar, i < currentIdx && styles.barActive]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function getIcon(s: Step): string {
  switch (s) {
    case "placed":
      return "📝";
    case "payment_confirmed":
      return "💳";
    case "processing":
      return "⚙️";
    case "shipped":
      return "📦";
    case "out_for_delivery":
      return "🚚";
    case "delivered":
      return "✅";
  }
}

function label(s: Step) {
  switch (s) {
    case "placed":
      return "Order Placed";
    case "payment_confirmed":
      return "Payment Confirmed";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "out_for_delivery":
      return "Out for Delivery";
    case "delivered":
      return "Delivered";
  }
}

function shortDate(d: string) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { paddingVertical: 8 },
    step: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
      position: "relative",
    },
    dot: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 2,
      borderColor: theme.colors.border.light,
      alignItems: "center",
      justifyContent: "center",
    },
    dotActive: {
      backgroundColor: theme.colors.accent.emerald,
      borderColor: theme.colors.accent.emerald,
    },
    dotCurrent: {
      borderWidth: 3,
      borderColor: theme.colors.accent.emerald,
      backgroundColor: theme.colors.accent.emerald,
    },
    icon: {
      fontSize: 20,
    },
    iconActive: {
      fontSize: 22,
    },
    bar: {
      position: "absolute",
      left: 19,
      top: 40,
      width: 2,
      height: 32,
      backgroundColor: theme.colors.border.light,
    },
    barActive: {
      backgroundColor: theme.colors.accent.emerald,
    },
    label: {
      color: theme.colors.text.secondary,
      fontSize: 15,
      fontWeight: "600",
    },
    labelActive: {
      color: theme.colors.text.primary,
      fontWeight: "700",
    },
    labelCurrent: {
      color: theme.colors.accent.emerald,
      fontWeight: "800",
    },
    time: {
      color: theme.colors.text.tertiary,
      marginTop: 2,
      fontSize: 12,
    }
  });
}
