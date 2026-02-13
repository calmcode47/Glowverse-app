import React from "react";
import CircularScore from "../common/CircularScore";

export default function SkinScoreCircle({ value }: { value: number }) {
  return <CircularScore value={value} size={120} strokeWidth={10} />;
}
