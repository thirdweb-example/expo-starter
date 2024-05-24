import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, TextInputProps, TextInput } from "react-native";

export type ThemedInputProps = {
	lightColor?: string;
	darkColor?: string;
} & TextInputProps;

export function ThemedInput(props: ThemedInputProps) {
	const border = useThemeColor(
		{ light: props.lightColor, dark: props.darkColor },
		"icon",
	);
	return (
		<TextInput
			style={[styles.input, { borderColor: border }]}
			placeholderTextColor={border}
			{...props}
		/>
	);
}

const styles = StyleSheet.create({
	input: {
		flex: 1,
		flexDirection: "row",
		gap: 8,
		padding: 12,
		borderRadius: 6,
		borderWidth: 1,
		borderStyle: "solid",
		justifyContent: "center",
		alignItems: "center",
	},
});
