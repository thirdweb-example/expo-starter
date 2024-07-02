import { Text, type TextProps, StyleSheet } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
	lightColor?: string;
	darkColor?: string;
	type?:
		| "default"
		| "title"
		| "defaultSemiBold"
		| "subtitle"
		| "link"
		| "subtext";
};

export function ThemedText({
	style,
	lightColor,
	darkColor,
	type = "default",
	...rest
}: ThemedTextProps) {
	const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
	const subTextColor = useThemeColor(
		{ light: lightColor, dark: darkColor },
		"subtext",
	);

	return (
		<Text
			style={[
				{ color: type === "subtext" ? subTextColor : color },
				type === "default" ? styles.default : undefined,
				type === "title" ? styles.title : undefined,
				type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
				type === "subtitle" ? styles.subtitle : undefined,
				type === "link" ? styles.link : undefined,
				type === "subtext" ? styles.subtext : undefined,
				style,
			]}
			{...rest}
		/>
	);
}

const styles = StyleSheet.create({
	default: {
		fontSize: 16,
		lineHeight: 24,
	},
	subtext: {
		fontSize: 14,
		lineHeight: 20,
	},
	defaultSemiBold: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: "600",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		lineHeight: 32,
	},
	subtitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	link: {
		lineHeight: 30,
		fontSize: 16,
		color: "#0a7ea4",
	},
});
