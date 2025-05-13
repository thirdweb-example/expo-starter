import { Platform } from "react-native";

if (Platform.OS !== "web") {
	import("@thirdweb-dev/react-native-adapter");
}
import "react-native-reanimated";
import "expo-router/entry";
