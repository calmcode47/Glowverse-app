import React from "react";
import { render } from "@testing-library/react-native";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { Button, Text } from "react-native-paper";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PaperProvider theme={MD3LightTheme}>{children}</PaperProvider>;
}

test("renders a Paper Button and matches snapshot", () => {
  const { toJSON, getByText } = render(
    <Wrapper>
      <Button onPress={() => {}}>
        <Text>Press me</Text>
      </Button>
    </Wrapper>
  );
  expect(getByText("Press me")).toBeTruthy();
  expect(toJSON()).toMatchSnapshot();
});
