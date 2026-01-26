import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/build/FontAwesome";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
  const router = useRouter();


  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.replace("/")}> 
        <Text style={styles.title}>Back to Home</Text>
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
