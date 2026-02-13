import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GenericError from "../GenericError";
import ServerError from "../ServerError";

describe("Error components", () => {
  it("renders GenericError and handles retry", () => {
    const onRetry = jest.fn();
    const { getByText } = render(<GenericError message="Oops" onRetry={onRetry} />);
    expect(getByText("Oops")).toBeTruthy();
    fireEvent.press(getByText("Retry"));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders ServerError with attempt label", () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ServerError onRetry={onRetry} attempt={2} />);
    expect(getByText(/Retry \(2\)/)).toBeTruthy();
  });
});
