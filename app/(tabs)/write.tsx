import { Image, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
	useReadContract,
	useActiveAccount,
	useSendAndConfirmTransaction,
} from "thirdweb/react";
import { balanceOf, claimTo, getNFT } from "thirdweb/extensions/erc721";
import { client, contract } from "@/constants/thirdweb";
import { shortenAddress } from "thirdweb/utils";
import { resolveScheme } from "thirdweb/storage";
import { ThemedButton } from "@/components/ThemedButton";
import { Link } from "expo-router";

export default function HomeScreen() {
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
				<ThemedText type="title">Transactions</ThemedText>
			</ThemedView>
			<WriteSection />
		</ParallaxScrollView>
	);
}

function WriteSection() {
	const account = useActiveAccount();
	const sendMutation = useSendAndConfirmTransaction();
	const balanceQuery = useReadContract(balanceOf, {
		contract,
		owner: account?.address!,
		queryOptions: { enabled: !!account },
	});
	const nftQuery = useReadContract(getNFT, {
		contract,
		tokenId: 1n,
	});

	const mint = async () => {
		if (!account) return;
		sendMutation.mutate(
			claimTo({
				contract,
				quantity: 1n,
				to: account.address,
			}),
		);
	};

	return (
		<>
			{account ? (
				<>
					<ThemedView style={{ gap: 4 }}>
						<ThemedText>
							Wallet:{" "}
							<ThemedText type="defaultSemiBold">
								{shortenAddress(account.address)}
							</ThemedText>
						</ThemedText>
						<ThemedText>
							NFTs owned:{" "}
							<ThemedText type="defaultSemiBold">
								{balanceQuery.data?.toString()}
							</ThemedText>
						</ThemedText>
					</ThemedView>
					{nftQuery.data && (
						<ThemedView
							style={{ justifyContent: "center", alignItems: "center" }}
						>
							<Image
								width={250}
								height={250}
								source={{
									uri: `${resolveScheme({
										client,
										uri: nftQuery.data.metadata.image || "",
									})}?bundleId=com.thirdweb.demo`,
								}}
							/>
						</ThemedView>
					)}
					<ThemedButton
						onPress={mint}
						title="Mint"
						loading={sendMutation.isPending}
						loadingTitle="Minting..."
					/>
					{sendMutation.error && (
						<ThemedText style={{ color: "red" }}>
							{sendMutation.error.message}
						</ThemedText>
					)}
				</>
			) : (
				<>
					<ThemedText>
						<Link href="(tabs)">
							<ThemedText type="link">Connect</ThemedText>
						</Link>{" "}
						a wallet to perform transactions
					</ThemedText>
				</>
			)}
		</>
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
