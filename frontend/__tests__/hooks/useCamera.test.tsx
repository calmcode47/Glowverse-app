import React from "react";
import { render, act } from "@testing-library/react-native";
import { CameraProvider } from "../../src/context/CameraContext";
import { useCamera } from "../../src/hooks/useCamera";

test("requestPermissions returns granted", async () => {
  let api: any;
  function Test() {
    api = useCamera();
    return null as any;
  }
  render(
    <CameraProvider>
      <Test />
    </CameraProvider>
  );
  let res: any;
  await act(async () => {
    res = await api.requestPermissions();
  });
  expect(res.camera).toBe(true);
  expect(res.mediaLibrary).toBe(true);
});
