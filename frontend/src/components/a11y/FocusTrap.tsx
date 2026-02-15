import React, { useEffect, useRef } from "react";
import { View, BackHandler } from "react-native";
import { focusManagement } from "../../utils/focusManagement";

type Props = {
  children: React.ReactNode;
  active?: boolean;
  returnFocus?: boolean;
  onEscape?: () => void;
};

export default function FocusTrap({ children, active = true, returnFocus = true, onEscape }: Props) {
  const containerRef = useRef<View>(null);
  const previousRef = useRef<any>(null);

  useEffect(() => {
    if (!active) return;
    if (returnFocus) previousRef.current = containerRef; // fallback
    if (containerRef.current) {
      focusManagement.setFocus(containerRef);
      focusManagement.announce("Modal opened");
    }
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (onEscape) {
        onEscape();
        return true;
      }
      return false;
    });
    return () => {
      sub.remove();
      if (returnFocus && previousRef.current) {
        focusManagement.setFocus(previousRef);
        focusManagement.announce("Modal closed");
      }
    };
  }, [active, returnFocus, onEscape]);

  return (
    <View
      ref={containerRef}
      accessible
      accessibilityLabel="Modal dialog"
      accessibilityViewIsModal
      accessibilityRole="header"
    >
      {children}
    </View>
  );
}
