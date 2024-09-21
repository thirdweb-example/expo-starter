import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useSocialProfiles } from "thirdweb/react";
import { ThirdwebClient } from "thirdweb";
import { resolveScheme } from "thirdweb/storage";
import { SocialProfile, FarcasterProfile, getSocialProfiles } from "thirdweb/social";
import { ThemedView } from "./ThemedView";

interface SocialProfileCardProps {
  address: string | undefined;
  client: ThirdwebClient;
}

export function SocialProfilesList({
  client,
  address,
}: SocialProfileCardProps) {
  const profiles = useSocialProfiles({
    client,
    address,
  });

  if (profiles.isLoading) {
    return <ThemedText type="default">Loading...</ThemedText>;
  }

  return profiles.data?.length ? (
    profiles.data?.map((profile) => <SocialProfileCard profile={profile} client={client} key={profile.type + profile.name} />)
  ) : (
    <ThemedText type="default">No social profiles found</ThemedText>
  );
}

export function SocialProfileCard({
  profile,
  client,
}: {
  profile: SocialProfile | undefined;
  client: ThirdwebClient;
}) {
  if (!profile) return null;
  return (
    <ThemedView style={styles.card}>
      <View style={styles.contentContainer}>
        {profile.avatar && (
          <Image source={{ uri: resolveScheme({ client, uri: profile.avatar }) }} style={styles.avatar} />
        )}
        <View style={styles.tableContainer}>
          <ThemedText type="defaultSemiBold">{profile.name}</ThemedText>
          <ThemedText type="default">{profile.bio || "-"}</ThemedText>
          <ThemedText type="subtext">{profile.type}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  tableContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
});
