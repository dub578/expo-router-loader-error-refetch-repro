import { Slot, type ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return <Text testID="error">root boundary: {error.message}</Text>;
}

export default function RootLayout() {
  // Hydration marker for count.mjs, so the click lands on a hydrated Link.
  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
  }, []);
  return <Slot />;
}
