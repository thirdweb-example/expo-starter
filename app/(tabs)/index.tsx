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
  useLinkProfile,
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
import { createWallet, ecosystemWallet } from "thirdweb/wallets";
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
            primaryButtonBg: "#e0142f",
            modalBg: "#e0142f",
            borderColor: "#ed3a51",
            accentButtonBg: "#b11025",
            primaryText: "#fef5f6",
            secondaryIconColor: "#e2dddd",
            secondaryText: "#e2dddd",
            secondaryButtonBg: "#ed3a51",
          },
        })}
        wallets={wallets}
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
      <ConnectWithPasskey />
      <View style={{ height: 16 }} />
      <ThemedButton onPress={() => disconnect(wallet)} title="Disconnect" />

    </View>
  ) : (
    <>
      <ConnectWithEcosystem />
      <ConnectWithJWT />
      <ConnectWithGoogle />
      <ConnectWithMetaMask />
      <ConnectWithPasskey />
    </>
  );
};

const ConnectWithEcosystem = () => {
  const { connect, isConnecting } = useConnect({
    client,
    accountAbstraction: {
      sponsorGas: true,
      chain
    }
  });
  return (
    <ThemedButton
      title="Connect with New Age"
      loading={isConnecting}
      loadingTitle="Connecting..."
      onPress={() => {
        connect(async () => {
          const w = ecosystemWallet("ecosystem.catfans");
          // const w = inAppWallet();
          await w.connect({
            client,
            strategy: "facebook",
          });
          return w;
        });
      }}
    />
  );
};


const ConnectWithJWT = () => {
  const { connect, isConnecting } = useConnect();
  return (
    <ThemedButton
      title="Connect with JWT"
      loading={isConnecting}
      loadingTitle="Connecting..."
      onPress={() => {
        connect(async () => {
          const w = inAppWallet();
          await w.connect({
            client,
            strategy: "jwt",
            jwt: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjAifQ.eyJpc3MiOiJodHRwczovL2VtYmVkZGVkLXdhbGxldC50aGlyZHdlYi1wcmV2aWV3LmNvbSIsInN1YiI6InRlc3RfY3VzdG9tX2p3dDpoZWxsbyIsImF1ZCI6WyJ0aGlyZHdlYl9qd2tfdGVzdF9hdWQiLCJzb21ldGhpbmdFbHNlIl0sImV4cCI6MTczNjM3Mzk0My4zMDcsImlhdCI6MTcyODU5Nzk0My4zMDcsIm5hbWUiOiJoZWxsbyIsInBpY3R1cmUiOiJodHRwOi8vZXhhbXBsZS5jb20vamFuZWRvZS9tZS5qcGcifQ.Hz9fnWUeYjE7bavcsMyvZghO95YW7rCR3zNW-J77QTaNT9o5n6w3PuqyegfBFSd8khTu6O9vUXdmRw1ppr2dqtC0Ue73IR-zevsltCrK-6M9KC2HVnTMgF8Fc583MN16P32SsbOiiq6argE8z1RbLux3SIIEq1GwBLECdspJf8LJUS4Z8rGWyZ0hXFx14Z3MF65weTpw_qRHy5udHoVBVGE6kNYdyWU256brCh46qgYtYRMcpeIoLZ5MUV3dWuXL9Yos8Wp1OU5HcT48S-eukv_BYT5PUB-9KGMZp9Zln-i5aHJCt3Ab4sVeUketx2afijGjN4sQjyDakz71WWLZiw",
            encryptionKey: "foo",
          });
          return w;
        });
      }}
    />
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
  const { mutateAsync:linkProfile } = useLinkProfile();
  return (
    <ThemedButton
      title="Login with Passkey"
      onPress={async () => {
        const res = await linkProfile({
          client,
          strategy: "passkey",
          type: "sign-up",
          passkeyName: "demo passkey",
        });
        console.log(res);
        // connect(async () => {
        //   const hasPasskey = await hasStoredPasskey(client);
        //   const w = inAppWallet({
        //     auth: {
        //       options: ["passkey"],
        //       passkeyDomain: "thirdweb.com",
        //     },
        //   });
        //   await w.connect({
        //     client,
        //     strategy: "passkey",
        //     type: hasPasskey ? "sign-in" : "sign-up",
        //   });
        //   return w;
        // });
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
