import joinPoolFromJelly from "./jelly-docs/src/joinPool";
import { SeiAgentKit } from "../../agent";
import { ethers } from "ethers";
import { Address } from "viem";
import { TokenData } from "./jelly-docs/src/helpers/generatePoolCreateData";

/**
 * Join a Jellyverse token pool
 * @param agent SeiAgentKit instance
 * @param poolId ID of the pool to join
 * @param tokensForPool Array of token configurations for the pool
 * @returns Promise with transaction hash
 */
export async function joinPool(
  agent: SeiAgentKit,
  poolId: string,
  tokensForPool: {
    tokenSymbol: string;
    address: string;
    amount: number;
    weight: number;
    decimals: number;
  }[]
): Promise<string> {
  try {
    if (!agent.walletClient || !agent.publicClient) {
      throw new Error("Wallet client or public client not initialized");
    }

    if (!agent.wallet_address) {
      throw new Error("Wallet address not specified");
    }

    // Convert viem client to ethers signer (needed for jelly-docs functions)
    
    const provider = new ethers.providers.JsonRpcProvider(
        agent.publicClient.transport.url
    );

    // Get private key from the wallet client (this depends on your agent setup)
    // For demo purposes, we're assuming this is accessible somehow
    // In a real scenario, you might need to pass the private key to this function or have another way to retrieve it
    const privateKey = process.env.SEI_PRIVATE_KEY as string;
    
    if (!privateKey) {
      throw new Error("Private key not available");
    }

    const signer = new ethers.Wallet(privateKey, provider);
    
    // Convert tokens to the format expected by jelly-docs
    const formattedTokens: TokenData[] = tokensForPool.map(token => ({
      tokenSymbol: token.tokenSymbol,
      address: token.address as `0x${string}` | string,
      amount: token.amount,
      weight: token.weight,
      decimals: token.decimals
    }));

    // Call the jelly-docs join pool function
    const txHash = await joinPoolFromJelly(
      signer,
      poolId,
      agent.wallet_address,
      formattedTokens
    );

    return `Successfully joined pool. Transaction hash: ${txHash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error in joinPool: ${errorMsg}`);
    throw error;
  }
}

