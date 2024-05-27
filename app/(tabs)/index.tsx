import { ActivityIndicator, Image, Pressable, StyleSheet } from "react-native";

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
import { useEffect, useMemo, useState } from "react";
import { ThemedInput } from "@/components/ThemedInput";
import {
	Wallet,
	WalletId,
	createWallet,
	getWalletInfo,
} from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { isLoaded, isLoading } from "expo-font";

const wallets = [
	inAppWallet({
		smartAccount: {
			chain,
			sponsorGas: true,
		},
	}),
	createWallet("io.metamask"),
	createWallet("me.rainbow"),
	createWallet("com.trustwallet.app"),
	createWallet("io.zerion.wallet"),
];
const externalWallets = wallets.slice(1);

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
		wallets,
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
					<ThemedText type="defaultSemiBold">In-app wallet</ThemedText>
					<ConnectWithPhoneNumber />
					<ConnectWithGoogle />
					<ThemedView style={{ height: 12 }} />
					<ThemedText type="defaultSemiBold">External wallet</ThemedText>
					<ThemedView
						style={{
							flexDirection: "row",
							gap: 24,
						}}
					>
						{externalWallets.map((w) => (
							<ConnectExternalWallet key={w.id} {...w} />
						))}
					</ThemedView>
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

function ConnectExternalWallet(wallet: Wallet) {
	const { connect, isConnecting, error } = useConnect();
	const [walletName, setWalletName] = useState<string | null>(null);
	const [walletImage, setWalletImage] = useState<string | null>(null);

	useEffect(() => {
		const fetchWalletName = async () => {
			const [name, image] = await Promise.all([
				getWalletInfo(wallet.id).then((info) => info.name),
				getWalletInfo(wallet.id, true),
			]);
			setWalletName(name);
			setWalletImage(image);
		};
		fetchWalletName();
	}, [wallet]);

	const connectExternalWallet = async () => {
		await connect(async () => {
			await wallet.connect({
				client,
			});
			return wallet;
		});
	};

	return (
		walletImage &&
		walletName && (
			<ThemedView
				style={{
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				{isConnecting && !error ? (
					<ActivityIndicator style={{ width: 60, height: 60 }} />
				) : (
					<>
						<Pressable onPress={connectExternalWallet} disabled={isConnecting}>
							<Image
								source={{ uri: walletImage ?? "" }}
								style={{ width: 60, height: 60, borderRadius: 6 }}
							/>
						</Pressable>
						<ThemedText style={{ fontSize: 11 }} type="defaultSemiBold">
							{walletName}
						</ThemedText>
					</>
				)}
			</ThemedView>
		)
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
			if (activeWallet?.id === "inApp") {
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
			} else {
				setEmail("");
			}
		};
		fetchEmail();
	}, [account]);

	const switchWallet = async () => {
		const activeIndex = connectedWallets.findIndex(
			(w) => w.id === activeWallet?.id,
		);
		const nextWallet =
			connectedWallets[(activeIndex + 1) % connectedWallets.length];
		if (nextWallet) {
			await setActive(nextWallet);
		}
	};

	return (
		<>
			{account ? (
				<>
					<ThemedText>Connected Wallets: </ThemedText>
					<ThemedView style={{ gap: 2 }}>
						{connectedWallets.map((w, i) => (
							<ThemedText key={w.id + i} type="defaultSemiBold">
								- {w.id} {w.id === activeWallet?.id ? "✅" : ""}
							</ThemedText>
						))}
					</ThemedView>
					<ThemedView style={{ height: 12 }} />
					<ThemedText>
						Active Wallet:{" "}
						<ThemedText type="defaultSemiBold">{activeWallet?.id}</ThemedText>{" "}
						{email && activeWallet?.id === "inApp" && (
							<ThemedText> ({email})</ThemedText>
						)}
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
					{connectedWallets.length > 1 && (
						<ThemedButton
							variant="secondary"
							title="Switch Wallet"
							onPress={switchWallet}
						/>
					)}
					<ThemedButton
						title="Disconnect"
						variant="secondary"
						onPress={async () => {
							if (activeWallet) {
								disconnect(activeWallet);
							}
						}}
					/>
					<ThemedView style={{ height: 12 }} />
					<ThemedText type="defaultSemiBold">Connect another wallet</ThemedText>
					<ThemedView
						style={{
							flexDirection: "row",
							gap: 24,
						}}
					>
						{externalWallets
							.filter(
								(w) => !connectedWallets.map((cw) => cw.id).includes(w.id),
							)
							.map((w, i) => (
								<ConnectExternalWallet key={w.id + i} {...w} />
							))}
					</ThemedView>
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
