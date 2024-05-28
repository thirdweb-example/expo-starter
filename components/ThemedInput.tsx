import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import {
	StyleSheet,
	TextInputProps,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { ThemedView } from "./ThemedView";
import Ionicons from "@expo/vector-icons/Ionicons";

export type ThemedInputProps = {
	lightColor?: string;
	darkColor?: string;
	onSubmit?: (value: string) => void;
	isSubmitting?: boolean;
} & TextInputProps;

export function ThemedInput(props: ThemedInputProps) {
	const [val, setVal] = React.useState("");
	const onSubmit = props.onSubmit;
	const borderColor = useThemeColor(
		{ light: props.lightColor, dark: props.darkColor },
		"border",
	);
	const primaryText = useThemeColor(
		{ light: props.lightColor, dark: props.darkColor },
		"text",
	);
	const secondaryText = useThemeColor(
		{ light: props.lightColor, dark: props.darkColor },
		"icon",
	);
	return (
		<ThemedView
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 8,
				borderRadius: 6,
				borderWidth: 1,
				borderStyle: "solid",
				borderColor: borderColor,
			}}
		>
			<TextInput
				placeholderTextColor={secondaryText}
				style={[styles.input, { color: primaryText, borderColor: borderColor }]}
				value={val}
				onChangeText={setVal}
				{...props}
			/>
			{onSubmit && (
				<TouchableOpacity
					onPress={() => onSubmit(val)}
					disabled={props.isSubmitting}
					style={{
						paddingVertical: 12,
						paddingHorizontal: 16,
					}}
				>
					{props.isSubmitting ? (
						<ActivityIndicator size={32} />
					) : (
						<Ionicons
							name="arrow-forward-circle-outline"
							size={32}
							color={secondaryText}
						/>
					)}
				</TouchableOpacity>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	input: {
		flex: 1,
		flexDirection: "row",
		gap: 8,
		padding: 12,
		justifyContent: "center",
		alignItems: "center",
	},
});
