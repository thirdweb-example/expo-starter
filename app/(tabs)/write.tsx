import { Image, Linking, StyleSheet, View } from "react-native";

import { ParallaxScrollView } from "@/components/ParallaxScrollView";
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
import { uploadMobile } from "thirdweb/storage";
import DocumentPicker from "react-native-document-picker";
import { getContract, sendTransaction } from "thirdweb";
import { mintTo } from "thirdweb/extensions/erc721";
import { useState } from "react";

export default function WriteScreen() {
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
			<View style={{ gap: 2 }}>
				<ThemedText type="subtitle">useSendTransaction()</ThemedText>
				<ThemedText type="subtext">
					Hook to submit transactions onchain from the connected wallet.
				</ThemedText>
			</View>
			<WriteSection />
			<View style={{ height: 12 }} />
			<UploadSection />
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
									})}`,
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

function UploadSection() {
	const [uri, setUri] = useState<string>();
	return (
		<>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">IPFS</ThemedText>
			</ThemedView>
			<View style={{ gap: 2 }}>
				<ThemedText type="subtitle">uploadMobile()</ThemedText>
				<ThemedText type="subtext">
					Utility function to upload files to IPFS.
				</ThemedText>
			</View>
			<ThemedButton
				title="Upload File"
				onPress={async () => {
					try {
						const res = await DocumentPicker.pick({
							type: [DocumentPicker.types.allFiles],
						});
						const upload = await uploadMobile({
							client,
							files: [
								{
									name: res[0].name,
									uri: res[0].uri,
									type: res[0].type,
								},
							],
							uploadWithoutDirectory: true,
						});
						setUri(upload[0]);
					} catch (err) {
						if (DocumentPicker.isCancel(err)) {
							console.log("User cancelled the picker");
						} else {
							throw err;
						}
					}
				}}
			/>
			<ThemedText
				type="link"
				onPress={() => {
					if (!uri) return;
					Linking.openURL(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
				}}
			>
				{uri && `Uploaded ${uri.slice(0, 25)}...`}
			</ThemedText>
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
