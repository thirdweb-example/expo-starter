import { ActivityIndicator, Image, StyleSheet } from "react-native";

import { ParallaxScrollView } from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
	useActiveAccount,
	useConnect,
	useDisconnect,
	useActiveWallet,
	useAutoConnect,
	useWalletBalance,
	useConnectedWallets,
	useSetActiveWallet,
} from "thirdweb/react";
import {
	getUserEmail,
	inAppWallet,
	preAuthenticate,
} from "thirdweb/wallets/in-app";
import { chain, client } from "@/constants/thirdweb";
import { shortenAddress } from "thirdweb/utils";
import { ThemedButton } from "@/components/ThemedButton";
import { useEffect, useState } from "react";
import { ThemedInput } from "@/components/ThemedInput";
import { createWallet, getWalletInfo } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

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
				<ThemedText type="title">Connecting Wallets</ThemedText>
			</ThemedView>
			<ConnectSection />
		</ParallaxScrollView>
	);
}

function ConnectSection() {
	const wallet = useActiveWallet();
	const autoConnect = useAutoConnect({
		client,
		wallets: [
			inAppWallet({
				smartAccount: {
					chain,
					sponsorGas: true,
				},
			}),
			createWallet("io.metamask"),
			createWallet("me.rainbow"),
		],
	});
	const autoConnecting = autoConnect.isLoading;

	if (autoConnecting) {
		return (
			<>
				<ActivityIndicator />
			</>
		);
	}

	return (
		<ThemedView style={styles.stepContainer}>
			{wallet ? (
				<>
					<ConnectedSection />
				</>
			) : (
				<ThemedView style={{ gap: 16 }}>
					<ThemedText>Sign in to access your in-app wallet</ThemedText>
					<ConnectWithPhoneNumber />
					<ThemedText style={{ textAlign: "center" }}>or</ThemedText>
					<ConnectWithGoogle />
					<ConnectWithMetamask />
					<ConnectWithRainbow />
				</ThemedView>
			)}
		</ThemedView>
	);
}
function ConnectWithGoogle() {
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
		<>
			<ThemedButton
				onPress={connectInAppWallet}
				title="Sign in with Google"
				loading={isConnecting}
				loadingTitle="Signing in..."
			/>
		</>
	);
}

function ConnectWithPhoneNumber() {
	const [screen, setScreen] = useState<"phone" | "sending" | "code">("phone");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const { connect, isConnecting } = useConnect();

	const sendSmsCode = async () => {
		if (!phoneNumber) return;
		setScreen("sending");
		await preAuthenticate({
			client,
			strategy: "phone",
			phoneNumber,
		});
		setScreen("code");
	};

	const connectInAppWallet = async () => {
		if (!verificationCode || !phoneNumber) return;
		await connect(async () => {
			const wallet = inAppWallet({
				smartAccount: {
					chain,
					sponsorGas: true,
				},
			});
			await wallet.connect({
				client,
				strategy: "phone",
				phoneNumber,
				verificationCode,
			});
			return wallet;
		});
	};

	if (screen === "phone") {
		return (
			<>
				<ThemedInput
					placeholder="Enter phone number"
					onChangeText={setPhoneNumber}
					value={phoneNumber}
					keyboardType="phone-pad"
				/>
				<ThemedButton
					onPress={sendSmsCode}
					title="Sign in with phone number"
					loading={isConnecting}
					loadingTitle="Signing in..."
				/>
			</>
		);
	}

	if (screen === "sending") {
		return (
			<>
				<ActivityIndicator />
				<ThemedText>Sending SMS code...</ThemedText>
			</>
		);
	}

	return (
		<>
			<ThemedInput
				placeholder="Enter verification code"
				onChangeText={setVerificationCode}
				value={verificationCode}
				keyboardType="numeric"
			/>
			<ThemedButton
				onPress={connectInAppWallet}
				title="Sign in"
				loading={isConnecting}
				loadingTitle="Signing in..."
			/>
		</>
	);
}

function ConnectWithMetamask() {
	const { connect, isConnecting } = useConnect();

	const connectMetamask = async () => {
		await connect(async () => {
			const wallet = createWallet("io.metamask");
			await wallet.connect({
				client,
				chain,
			});
			return wallet;
		});
	};

	return (
		<>
			<ThemedButton
				onPress={connectMetamask}
				title="Sign in with Metamask"
				loading={isConnecting}
				loadingTitle="Signing in..."
			/>
		</>
	);
}

function ConnectWithRainbow() {
	const { connect, isConnecting } = useConnect();

	const connectRainbow = async () => {
		await connect(async () => {
			const wallet = createWallet("me.rainbow");
			await wallet.connect({
				client,
				chain: polygon,
			});
			return wallet;
		});
	};

	return (
		<>
			<ThemedButton
				onPress={connectRainbow}
				title="Sign in with Rainbow"
				loading={isConnecting}
				loadingTitle="Signing in..."
			/>
		</>
	);
}

function ConnectedSection() {
	const { disconnect } = useDisconnect();
	const account = useActiveAccount();
	const activeWallet = useActiveWallet();
	const setActive = useSetActiveWallet();
	const connectedWallets = useConnectedWallets();
	const balanceQuery = useWalletBalance({
		address: account?.address,
		chain: activeWallet?.getChain(),
		client,
	});
	const [email, setEmail] = useState("");
	useEffect(() => {
		const fetchEmail = async () => {
			try {
				const email = await getUserEmail({
					client,
				});
				if (email) {
					setEmail(email);
				}
			} catch (e) {
				// no email
			}
		};
		fetchEmail();
	}, [account]);

	const switchWallet = async () => {
		const nextWallet = connectedWallets.find((w) => w.id !== activeWallet?.id);
		if (nextWallet) {
			await setActive(nextWallet);
		}
	};

	return (
		<>
			{account ? (
				<>
					<ThemedText>
						Active Wallet:{" "}
						<ThemedText type="defaultSemiBold">{activeWallet?.id}</ThemedText>{" "}
						{email && <ThemedText> ({email})</ThemedText>}
					</ThemedText>
					<ThemedText>
						Connected Wallets:{" "}
						<ThemedText type="defaultSemiBold">
							{connectedWallets.map((w) => w.id).join(", ")}
						</ThemedText>
					</ThemedText>
					<ThemedText>
						Address:{" "}
						<ThemedText type="defaultSemiBold">
							{shortenAddress(account.address)}
						</ThemedText>
					</ThemedText>
					<ThemedText>
						Chain:{" "}
						<ThemedText type="defaultSemiBold">
							{activeWallet?.getChain()?.name || "Unknown"}
						</ThemedText>
					</ThemedText>
					<ThemedText>
						Balance:{" "}
						{balanceQuery.data && (
							<ThemedText type="defaultSemiBold">
								{`${balanceQuery.data?.displayValue.slice(0, 8)} ${
									balanceQuery.data?.symbol
								}`}
							</ThemedText>
						)}
					</ThemedText>
					<ThemedView style={{ height: 12 }} />
					{connectedWallets.length == 1 && activeWallet?.id == "io.metamask" ? (
						<ConnectWithRainbow />
					) : (
						<ThemedButton title="Switch Wallet" onPress={switchWallet} />
					)}
					<ThemedButton
						title="Log out"
						variant="secondary"
						onPress={async () => {
							if (activeWallet) {
								if (connectedWallets.length > 1) {
									await switchWallet();
								}
								disconnect(activeWallet);
							}
						}}
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
