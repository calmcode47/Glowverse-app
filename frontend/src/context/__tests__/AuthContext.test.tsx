import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import { AuthProvider, useAuth } from "../AuthContext";

jest.mock("../../services/api/auth.api", () => ({
  __esModule: true,
  login: jest.fn(async ({ email }: any) => ({
    user: { id: "1", email, name: "Test User" },
    tokens: { accessToken: "token123", refreshToken: "refresh123" }
  })),
  register: jest.fn(async ({ email }: any) => ({
    user: { id: "2", email, name: "New User" },
    tokens: { accessToken: "regToken", refreshToken: "regRefresh" }
  })),
  logout: jest.fn(async () => {}),
  getProfile: jest.fn(async () => ({ user: { id: "1", email: "test@example.com", name: "Test User" } }))
}));

jest.mock("../../services/api/client", () => {
  const original = jest.requireActual("../../services/api/client");
  return {
    __esModule: true,
    ...original,
    client: {
      post: jest.fn(async () => ({ data: { accessToken: "newToken123", refreshToken: "newRefresh123" } })),
      get: jest.fn(async () => ({ data: { user: { id: "1", email: "test@example.com", name: "Test User" } } }))
    }
  };
});

function Harness() {
  const { user, accessToken, isAuthenticated, login, logout, refreshAuth } = useAuth();
  return (
    <>
      <TextPrint testID="auth-state">{isAuthenticated ? "auth" : "anon"}</TextPrint>
      <TextPrint testID="user-email">{user?.email || "none"}</TextPrint>
      <TextPrint testID="token">{accessToken || "none"}</TextPrint>
      <Button title="login" onPress={() => login("test@example.com", "password123")} />
      <Button title="logout" onPress={() => logout()} />
      <Button title="refresh" onPress={() => refreshAuth()} />
    </>
  );
}

function TextPrint({ children, testID }: { children: React.ReactNode; testID?: string }) {
  return <Text testID={testID}>{children}</Text>;
}
function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress}><Text>{title}</Text></TouchableOpacity>;
}

describe("AuthContext", () => {
  it("logs in successfully", async () => {
    const ui = render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );
    fireEvent.press(ui.getByText("login"));
    await waitFor(() => {
      expect(ui.getByTestId("auth-state").props.children).toBe("auth");
      expect(ui.getByTestId("user-email").props.children).toBe("test@example.com");
      expect(ui.getByTestId("token").props.children).toBe("token123");
    });
  });

  it("logs out user", async () => {
    const ui = render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );
    // login first
    fireEvent.press(ui.getByText("login"));
    await waitFor(() => expect(ui.getByTestId("auth-state").props.children).toBe("auth"));
    // logout
    fireEvent.press(ui.getByText("logout"));
    await waitFor(() => {
      expect(ui.getByTestId("auth-state").props.children).toBe("anon");
      expect(ui.getByTestId("user-email").props.children).toBe("none");
      expect(ui.getByTestId("token").props.children).toBe("none");
    });
  });

  it("refreshes token", async () => {
    const ui = render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );
    // login first to create initial token
    fireEvent.press(ui.getByText("login"));
    await waitFor(() => expect(ui.getByTestId("token").props.children).toBe("token123"));
    // refresh
    fireEvent.press(ui.getByText("refresh"));
    await waitFor(() => expect(ui.getByTestId("token").props.children).toBe("newToken123"));
  });
});
