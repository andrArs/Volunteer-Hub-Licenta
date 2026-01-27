import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/build/FontAwesome";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
  const router = useRouter();
  const TEST_EVENT_ID = "a5105d3f-704f-41f5-8d1b-055c33bf54a0";


  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.replace("/")}> 
        <Text style={styles.title}>Back to Home</Text>
      </Pressable>

      <Pressable

        onPress={() => router.push(`/event.update?id=${TEST_EVENT_ID}`)}
      >
        <Text style={styles.title}>Go to Edit Event (test)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
