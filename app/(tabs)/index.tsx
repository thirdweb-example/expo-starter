import { Image, StyleSheet } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
	useReadContract,
	useActiveAccount,
	useConnect,
	useSendTransaction,
} from "thirdweb/react";
import { balanceOf, claimTo, totalSupply } from "thirdweb/extensions/erc721";
import { inAppWallet } from "thirdweb/wallets/in-app";
import { chain, client, contract } from "@/constants/thirdweb";
import { shortenAddress } from "thirdweb/utils";
import { ThemedButton } from "@/components/ThemedButton";

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
				<HelloWave />
				<ThemedText type="title">thirdweb native</ThemedText>
			</ThemedView>
			<ReadSection />
			<ConnectSection />
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
			<ThemedText type="subtitle">Onchain read</ThemedText>
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

function ConnectSection() {
	const account = useActiveAccount();
	const { connect, isConnecting } = useConnect();

	const connectInAppWallet = async () => {
		await connect(async () => {
			const wallet = inAppWallet({
				smartAccount: {
					chain,
					sponsorGas: true,
				},
			});
			await wallet.connect({
				client,
				strategy: "google",
				redirectUrl: "com.thirdweb.demo://",
			});
			return wallet;
		});
	};
	return (
		<ThemedView style={styles.stepContainer}>
			<ThemedText type="subtitle">Onchain write</ThemedText>
			{account ? (
				<WriteSection />
			) : (
				<>
					<ThemedText>Sign in to access your in-app wallet</ThemedText>
					<ThemedButton
						onPress={connectInAppWallet}
						title="Sign in with Google"
						loading={isConnecting}
						loadingTitle="Signing in..."
					/>
				</>
			)}
		</ThemedView>
	);
}

function WriteSection() {
	const account = useActiveAccount();
	const sendMutation = useSendTransaction();
	const balanceQuery = useReadContract(balanceOf, {
		contract,
		owner: account!.address,
		queryOptions: { enabled: !!account },
	});

	const mint = async () => {
		if (!account) return;
		await sendMutation.mutateAsync(
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
					<ThemedButton
						onPress={mint}
						title="Mint"
						loading={sendMutation.isPending}
						loadingTitle="Minting..."
					/>
				</>
			) : (
				<>
					<ThemedText>Connect to mint an NFT.</ThemedText>
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
