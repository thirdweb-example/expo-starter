import { StyleSheet, Image, ActivityIndicator, View } from "react-native";

import { ParallaxScrollView } from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useContractEvents, useReadContract } from "thirdweb/react";
import { client, contract, usdcContract } from "@/constants/thirdweb";
import { totalSupply } from "thirdweb/extensions/erc721";
import { transferEvent } from "thirdweb/extensions/erc20";
import { toTokens } from "thirdweb";
import { shortenAddress } from "thirdweb/utils";
import { SocialProfilesList } from "../../components/SocialProfileCard";

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
      <SocialSection />
      <ReadSection />
      <EventsSection />
    </ParallaxScrollView>
  );
}

function SocialSection() {
  return (
    <ThemedView style={styles.stepContainer}>
      <View style={{ gap: 2 }}>
        <ThemedText type="subtitle">{`useSocialProfiles()`}</ThemedText>
        <ThemedText type="subtext">
          Fetch all known social profiles for any wallet address.
        </ThemedText>
      </View>
      <SocialProfilesList
        address={"0x2247d5d238d0f9d37184d8332aE0289d1aD9991b"}
        client={client}
      />
    </ThemedView>
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
      <View style={{ gap: 2 }}>
        <ThemedText type="subtitle">useReadContract()</ThemedText>
        <ThemedText type="subtext">
          Hook to read contract data, with auto refetching.
        </ThemedText>
      </View>
      <View style={{ gap: 2 }}>
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
      </View>
    </ThemedView>
  );
}

function EventsSection() {
  const eventsQuery = useContractEvents({
    contract: usdcContract,
    events: [transferEvent()],
    blockRange: 10,
  });

  return (
    <ThemedView style={styles.stepContainer}>
      <View style={{ gap: 2 }}>
        <ThemedText type="subtitle">useContractEvents()</ThemedText>
        <ThemedText type="subtext">
          Hook to subscribe to live contract events.
        </ThemedText>
      </View>
      <ThemedView style={{ height: 4 }} />
      <ThemedText>
        Live <ThemedText type="defaultSemiBold">USDC</ThemedText> transfers
      </ThemedText>
      {eventsQuery.isLoading && <ActivityIndicator />}
      {eventsQuery.data
        ?.slice(-10)
        ?.reverse()
        ?.map((event, i) => {
          return (
            <ThemedView key={`${event.transactionHash}${i}`} style={{ gap: 4 }}>
              <ThemedText>
                {shortenAddress(event.args.from)} sent{" "}
                <ThemedText type="defaultSemiBold">
                  {toTokens(event.args.value, 6)} USDC
                </ThemedText>{" "}
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
