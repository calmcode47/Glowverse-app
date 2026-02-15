import React from "react";
import { render } from "@testing-library/react-native";
import ScoreDisplay from "../../../src/components/analysis/ScoreDisplay";

describe("ScoreDisplay", () => {
  it("renders score", () => {
    const { getByText } = render(<ScoreDisplay score={85} />);
    expect(getByText("Great overall skin health")).toBeTruthy();
  });
});

