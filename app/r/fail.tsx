import { Link, useLoaderData, type ErrorBoundaryProps } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

// Counts boundary mounts so count.mjs can wait for the retry's own error.
let mounts = 0;

export async function loader() {
  throw new Error("loader failed on purpose");
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const [mount] = useState(() => ++mounts);
  return (
    <View>
      <Text testID="error">
        route boundary #{mount}: {error.message}
      </Text>
      <Pressable testID="retry" onPress={() => void retry()}>
        <Text>Retry</Text>
      </Pressable>
      <Link href="/r/start" testID="back">Back to start</Link>
    </View>
  );
}

export default function RFail() {
  useLoaderData<typeof loader>();
  return <Text>unreachable</Text>;
}
