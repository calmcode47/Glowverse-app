export const useTestID = (testID: string) => {
  const enable = (globalThis as any)?.process?.env?.ENABLE_TEST_IDS === "true";
  if (__DEV__ || enable) {
    return { testID };
  }
  return {};
};
