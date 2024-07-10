import { base, baseSepolia, mainnet, sepolia } from "viem/chains";
import type { GetName, GetNameReturnType } from "../types";
import { Chain } from "viem";
import L2ResolverAbi from "../../abis/L2ResolverAbi";
import {
  USERNAME_L2_RESOLVER_ADDRESSES,
  convertReverseNodeToBytes,
} from "../../utils/baseUsername";
import { publicClient } from "../../network/client";
import {
  baseChainsIds,
  chainsById,
  ensUniversalResolverChainIds,
  getChainPublicClient,
} from "../../network/chains";

/**
 * An asynchronous function to fetch the Ethereum Name Service (ENS)
 * name for a given Ethereum address. It returns the ENS name if it exists,
 * or null if it doesn't or in case of an error.
 */

export const getName = async ({
  address,
  chainId = mainnet.id,
}: GetName): Promise<GetNameReturnType> => {
  const chainSupportsUniversalResolver =
    ensUniversalResolverChainIds.includes(chainId);
  const chainIsBase = baseChainsIds.includes(chainId);
  let chain = chainsById[chainId];

  if (!chainSupportsUniversalResolver) {
    throw Error(
      `ChainId not supported, name resolution is only supported on ${ensUniversalResolverChainIds.join(
        ", "
      )}.`
    );
  }

  const client = getChainPublicClient(chainId);

  // Base username
  if (chainIsBase) {
    const addressReverseNode = convertReverseNodeToBytes(address);
    const readContractArgs = {
      abi: L2ResolverAbi,
      address: USERNAME_L2_RESOLVER_ADDRESSES[chain.id],
      functionName: "name",
      args: [addressReverseNode],
      chainId: chain.id,
    };

    const baseEnsName = await client.readContract(readContractArgs);
    return typeof baseEnsName === "string" ? baseEnsName : null;
  }

  // ENS username
  const ensName = await client.getEnsName({
    address,
  });

  return ensName ?? null;
};
