import React from "react";
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Svg, { Rect } from "react-native-svg";
import type { SkinConcern } from "../../services/ai/types";

type Props = {
  imageUri: string;
  concerns: SkinConcern[];
  activeConcern?: string;
  onConcernToggle: (concernType: string) => void;
  height?: number;
};

function sevColor(sev: SkinConcern["severity"]) {
  if (sev === "severe") return "#F44336";
  if (sev === "moderate") return "#FF9800";
  return "#FFC107";
}

const regionBox: Record<string, { cx: number; cy: number; w: number; h: number }> = {
  forehead: { cx: 0.5, cy: 0.2, w: 0.6, h: 0.22 },
  cheeks: { cx: 0.5, cy: 0.55, w: 0.8, h: 0.3 },
  nose: { cx: 0.5, cy: 0.5, w: 0.18, h: 0.25 },
  chin: { cx: 0.5, cy: 0.8, w: 0.4, h: 0.18 },
  under_eyes: { cx: 0.5, cy: 0.45, w: 0.6, h: 0.15 },
  around_mouth: { cx: 0.5, cy: 0.72, w: 0.5, h: 0.14 },
  jawline: { cx: 0.5, cy: 0.85, w: 0.85, h: 0.2 },
  t_zone: { cx: 0.5, cy: 0.5, w: 0.3, h: 0.5 },
  full_face: { cx: 0.5, cy: 0.5, w: 1.0, h: 1.0 }
};

export default function SkinConcernOverlay({ imageUri, concerns, activeConcern, onConcernToggle, height = 240 }: Props) {
  const { width: screenW } = Dimensions.get("window");
  const imgW = screenW;
  const imgH = height;

  const activeSet = new Set<string>(activeConcern ? [activeConcern] : concerns.map(c => c.type));

  return (
    <View style={[styles.container, { height: imgH }]}>
      <Image source={{ uri: imageUri }} style={{ width: imgW, height: imgH, position: "absolute" }} resizeMode="cover" />
      <Svg width={imgW} height={imgH}>
        {concerns.map((c, idx) => {
          const areas = c.affectedAreas?.length ? c.affectedAreas : (["full_face"] as Array<keyof typeof regionBox>);
          const visible = activeSet.has(c.type);
          return areas.map((a: keyof typeof regionBox, i: number) => {
            const box = regionBox[a] || regionBox["full_face"];
            const w = box.w * imgW;
            const h = box.h * imgH;
            const x = box.cx * imgW - w / 2;
            const y = box.cy * imgH - h / 2;
            return (
              <Rect
                key={`${idx}-${i}`}
                x={x}
                y={y}
                width={w}
                height={h}
                fill={visible ? sevColor(c.severity) : "transparent"}
                opacity={visible ? 0.22 : 0}
                stroke={visible ? sevColor(c.severity) : "transparent"}
                strokeWidth={visible ? 1 : 0}
                rx={12}
              />
            );
          });
        }).flat()}
      </Svg>
      <View style={styles.tapZone}>
        {concerns.map(c => (
          <TouchableOpacity key={c.type} onPress={() => onConcernToggle(c.type)} style={styles.toggle} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", overflow: "hidden", borderRadius: 12, backgroundColor: "#000" },
  tapZone: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  toggle: { width: "100%", height: "100%" }
});
