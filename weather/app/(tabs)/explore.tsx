import { SafeAreaView, ScrollView, Text } from "@/components/ui";

export default function ExploreScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <Text variant="h1" className="mb-2">
          Explore
        </Text>
        <Text variant="muted">
          This is the explore tab.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
