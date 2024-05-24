import { StyleSheet, Image } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useContractEvents, useReadContract } from "thirdweb/react";
import { contract, usdcContract } from "@/constants/thirdweb";
import { totalSupply } from "thirdweb/extensions/erc721";
import { transferEvent } from "thirdweb/extensions/erc20";
import { name } from "thirdweb/extensions/common";
import { toTokens } from "thirdweb";
import { shortenAddress } from "thirdweb/utils";

export default function ReadScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
			headerImage={
				<Image
					source={require("@/assets/images/title.png")}
					style={styles.reactLogo}
				/>
			}
		>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Read onchain data</ThemedText>
			</ThemedView>
			<ReadSection />
			<EventsSection />
		</ParallaxScrollView>
	);
}

function ReadSection() {
	const nameQuery = useReadContract({
		contract,
		method: "function name() returns (string)",
	});
	const supplyQuery = useReadContract(totalSupply, {
		contract,
	});

	return (
		<ThemedView style={styles.stepContainer}>
			<ThemedText type="subtitle">Contract state</ThemedText>
			<ThemedText>
				Contract name:{" "}
				<ThemedText type="defaultSemiBold">{nameQuery.data}</ThemedText>{" "}
			</ThemedText>
			<ThemedText>
				Supply:{" "}
				<ThemedText type="defaultSemiBold">
					{supplyQuery.data?.toString()}
				</ThemedText>{" "}
			</ThemedText>
		</ThemedView>
	);
}

function EventsSection() {
	const nameQuery = useReadContract(name, {
		contract: usdcContract,
	});
	const eventsQuery = useContractEvents({
		contract: usdcContract,
		events: [transferEvent()],
		blockRange: 10,
	});

	return (
		<ThemedView style={styles.stepContainer}>
			<ThemedText type="subtitle">Contract Events</ThemedText>
			<ThemedText>
				Contract name:{" "}
				<ThemedText type="defaultSemiBold">{nameQuery.data}</ThemedText>{" "}
			</ThemedText>
			{eventsQuery.data
				?.slice(-10)
				?.reverse()
				?.map((event, i) => {
					return (
						<ThemedView key={`${event.transactionHash}${i}`} style={{ gap: 4 }}>
							<ThemedText>
								💰 New payment:{" "}
								<ThemedText type="defaultSemiBold">
									{toTokens(event.args.value, 6)} USDC
								</ThemedText>{" "}
							</ThemedText>
							<ThemedText>
								{shortenAddress(event.args.from)} ➡️{" "}
								{shortenAddress(event.args.to)}
							</ThemedText>
						</ThemedView>
					);
				})}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: "100%",
		width: "100%",
		bottom: 0,
		left: 0,
		position: "absolute",
	},
});
