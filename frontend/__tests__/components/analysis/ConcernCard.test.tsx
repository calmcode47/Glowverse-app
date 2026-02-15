import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ConcernCard from "../../../src/components/analysis/ConcernCard";
import type { SkinConcern } from "../../../src/services/ai/types";

describe("ConcernCard", () => {
  const item: SkinConcern = {
    type: "acne",
    severity: "moderate",
    confidence: 0.82,
    affectedAreas: ["cheeks", "chin"],
    description: "Some acne detected on cheeks and chin"
  };

  it("renders title and severity", () => {
    const { getByText } = render(<ConcernCard item={item} />);
    expect(getByText("Acne")).toBeTruthy();
    expect(getByText("MODERATE")).toBeTruthy();
  });

  it("expands description on press", () => {
    const { getByText, queryByText } = render(<ConcernCard item={item} />);
    expect(queryByText(item.description!)).toBeNull();
    fireEvent.press(getByText("Acne"));
    expect(getByText(item.description!)).toBeTruthy();
  });
});

