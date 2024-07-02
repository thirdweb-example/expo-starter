import { createThirdwebClient, getContract } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";
import { setThirdwebDomains } from "thirdweb/utils";

const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID!;

if (!clientId) {
  throw new Error(
    "Missing EXPO_PUBLIC_THIRDWEB_CLIENT_ID - make sure to set it in your .env file"
  );
}

export const client = createThirdwebClient({
  clientId,
});

export const chain = baseSepolia;

export const contract = getContract({
  client,
  address: "0x82e50a6BF13A70366eDFC871f8FB8a428C43Dc03",
  chain,
});

export const usdcContract = getContract({
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  chain: base,
  client,
});
