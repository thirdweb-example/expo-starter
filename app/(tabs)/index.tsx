import { Image, StyleSheet, View, useColorScheme } from "react-native";

import { ParallaxScrollView } from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  useActiveAccount,
  useConnect,
  useDisconnect,
  useActiveWallet,
  ConnectButton,
  lightTheme,
  ConnectEmbed,
} from "thirdweb/react";
import {
  getUserEmail,
  hasStoredPasskey,
  inAppWallet,
} from "thirdweb/wallets/in-app";
import { chain, client } from "@/constants/thirdweb";
import { shortenAddress } from "thirdweb/utils";
import { ThemedButton } from "@/components/ThemedButton";
import { useEffect, useState } from "react";
import { createWallet } from "thirdweb/wallets";
import { baseSepolia, ethereum } from "thirdweb/chains";
import { createAuth } from "thirdweb/auth";

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "facebook",
        "discord",
        "telegram",
        "email",
        "phone",
        "passkey",
      ],
      passkeyDomain: "thirdweb.com",
    },
    smartAccount: {
      chain: baseSepolia,
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet", {
    appMetadata: {
      name: "Thirdweb RN Demo",
    },
    mobileConfig: {
      callbackURL: "https://thirdweb.com",
    },
    walletConfig: {
      options: "smartWalletOnly",
    },
  }),
  createWallet("me.rainbow"),
  createWallet("com.trustwallet.app"),
  createWallet("io.zerion.wallet"),
];

const thirdwebAuth = createAuth({
  domain: "localhost:3000",
  client,
});

// fake login state, this should be returned from the backend
let isLoggedIn = false;

export default function HomeScreen() {
  const account = useActiveAccount();
  const theme = useColorScheme();
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
      <View style={{ gap: 2 }}>
        <ThemedText type="subtitle">{`<ConnectButton />`}</ThemedText>
        <ThemedText type="subtext">
          Configurable button + modal, handles both connection and connected
          state. Example below has Smart Accounts + sponsored transactions
          enabled.
        </ThemedText>
      </View>
      <ConnectButton
        client={client}
        theme={theme || "dark"}
        wallets={wallets}
        chain={baseSepolia}
      />
      <View style={{ gap: 2 }}>
        <ThemedText type="subtitle">{`Themed <ConnectButton />`}</ThemedText>
        <ThemedText type="subtext">
          Styled the Connect Button to match your app.
        </ThemedText>
      </View>
      <ConnectButton
        client={client}
        theme={lightTheme({
          colors: {
            primaryButtonBg: "#1e8449",
            modalBg: "#1e8449",
            borderColor: "#196f3d",
            accentButtonBg: "#196f3d",
            primaryText: "#ffffff",
            secondaryIconColor: "#a7b8b9",
            secondaryText: "#a7b8b9",
            secondaryButtonBg: "#196f3d",
          },
        })}
        wallets={[
          createWallet("io.metamask"),
          createWallet("com.coinbase.wallet"),
          createWallet("me.rainbow"),
          createWallet("com.trustwallet.app"),
          createWallet("io.zerion.wallet"),
          createWallet("xyz.argent"),
          createWallet("com.okex.wallet"),
          createWallet("com.zengo")
        ]}
        connectButton={{
          label: "Sign in to ✨ MyApp",
        }}
        connectModal={{
          title: "✨ MyApp Login",
        }}
      />
      <View style={{ height: 16 }} />
      <View style={{ gap: 2 }}>
        <ThemedText type="subtitle">{`<ConnectEmbed />`}</ThemedText>
        <ThemedText type="subtext">
          Embeddable connection component in any screen. Example below is
          configured with a specific list of EOAs + SIWE.
        </ThemedText>
      </View>
      <ConnectEmbed
        client={client}
        theme={theme || "dark"}
        chain={ethereum}
        wallets={wallets}
        auth={{
          async doLogin(params) {
            // fake delay
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const verifiedPayload = await thirdwebAuth.verifyPayload(params);
            isLoggedIn = verifiedPayload.valid;
          },
          async doLogout() {
            isLoggedIn = false;
          },
          async getLoginPayload(params) {
            return thirdwebAuth.generatePayload(params);
          },
          async isLoggedIn(address) {
            return isLoggedIn;
          },
        }}
      />
      {account && (
        <ThemedText type="subtext">
          ConnectEmbed does not render when connected, use the `onConnect` prop
          to navigate to a new screen instead.
        </ThemedText>
      )}
      <View style={{ height: 16 }} />
      <View style={{ gap: 2 }}>
        <ThemedText type="subtitle">{`useConnect()`}</ThemedText>
        <ThemedText type="subtext">
          Hooks to build your own UI. Example below connects to a smart Google
          account or metamask EOA.
        </ThemedText>
      </View>
      <CustomConnectUI />
    </ParallaxScrollView>
  );
}

const CustomConnectUI = () => {
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const [email, setEmail] = useState<string | undefined>();
  const { disconnect } = useDisconnect();
  useEffect(() => {
    if (wallet && wallet.id === "inApp") {
      getUserEmail({ client }).then(setEmail);
    }
  }, [wallet]);

  return wallet && account ? (
    <View>
      <ThemedText>Connected as {shortenAddress(account.address)}</ThemedText>
      {email && <ThemedText type="subtext">{email}</ThemedText>}
      <View style={{ height: 16 }} />
      <ThemedButton onPress={() => disconnect(wallet)} title="Disconnect" />
    </View>
  ) : (
    <>
      <ConnectWithGoogle />
      <ConnectWithMetaMask />
      <ConnectWithPasskey />
    </>
  );
};

const ConnectWithGoogle = () => {
  const { connect, isConnecting } = useConnect();
  return (
    <ThemedButton
      title="Connect with Google"
      loading={isConnecting}
      loadingTitle="Connecting..."
      onPress={() => {
        connect(async () => {
          const w = inAppWallet({
            smartAccount: {
              chain,
              sponsorGas: true,
            },
          });
          await w.connect({
            client,
            strategy: "google",
          });
          return w;
        });
      }}
    />
  );
};

const ConnectWithMetaMask = () => {
  const { connect, isConnecting } = useConnect();
  return (
    <ThemedButton
      title="Connect with MetaMask"
      variant="secondary"
      loading={isConnecting}
      loadingTitle="Connecting..."
      onPress={() => {
        connect(async () => {
          const w = createWallet("io.metamask");
          await w.connect({
            client,
          });
          return w;
        });
      }}
    />
  );
};

const ConnectWithPasskey = () => {
  const { connect } = useConnect();
  return (
    <ThemedButton
      title="Login with Passkey"
      onPress={() => {
        connect(async () => {
          const hasPasskey = await hasStoredPasskey(client);
          const w = inAppWallet({
            auth: {
              options: ["passkey"],
              passkeyDomain: "thirdweb.com",
            },
          });
          await w.connect({
            client,
            strategy: "passkey",
            type: hasPasskey ? "sign-in" : "sign-up",
          });
          return w;
        });
      }}
    />
  );
};

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
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "space-evenly",
  },
  tableContainer: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  leftColumn: {
    flex: 1,
    textAlign: "left",
  },
  rightColumn: {
    flex: 1,
    textAlign: "right",
  },
});
