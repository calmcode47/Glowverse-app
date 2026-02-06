import React from "react";
import { render } from "@testing-library/react-native";
import { CameraProvider } from "@context/CameraContext";
import { useCamera } from "@hooks/useCamera";

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
  const res = await api.requestPermissions();
  expect(res.camera).toBe(true);
  expect(res.mediaLibrary).toBe(true);
});
