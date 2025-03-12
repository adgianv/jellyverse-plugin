import createPoolFromJelly from "./jelly-docs/src/createPool";
import getPoolIdFromJelly from "./jelly-docs/src/getPoolId";
import addApprovalsFromJelly from "./jelly-docs/src/addApprovals";
import { SeiAgentKit } from "../../agent";
import { ethers } from "ethers";
import { TokenData } from "./jelly-docs/src/helpers/generatePoolCreateData";

/**
 * Create a new Jellyverse token pool
 * @param agent SeiAgentKit instance
 * @param poolName Name of the pool to create
 * @param tokensForPool Array of token configurations for the pool
 * @param fee Pool fee percentage (e.g., 0.01 for 1%)
 * @returns Promise with pool ID
 */
export async function createPool(
  agent: SeiAgentKit,
  poolName: string,
  tokensForPool: {
    tokenSymbol: string;
    address: string;
    amount: number;
    weight: number;
    decimals: number;
  }[],
  fee: number
): Promise<string> {
  try {
    if (!agent.walletClient || !agent.publicClient) {
      throw new Error("Wallet client or public client not initialized");
    }

    if (!agent.wallet_address) {
      throw new Error("Wallet address not specified");
    }

    // Validate pool parameters
    validatePoolParams(tokensForPool, fee);

    // Convert viem client to ethers signer (needed for jelly-docs functions)
    const provider = new ethers.providers.JsonRpcProvider(
      agent.publicClient.transport.url
    );

    // Get private key from the wallet client
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

    // Step 1: Approve tokens first (needed for pool creation)
    console.log("Approving tokens for pool creation...");
    const approvals = await addApprovalsFromJelly(signer, formattedTokens);
    console.log(`Tokens approved: ${approvals}`);

    // Step 2: Create the pool
    console.log("Creating pool...");
    const poolAddress = await createPoolFromJelly(
      signer, 
      poolName, 
      formattedTokens, 
      fee, 
      agent.wallet_address
    );
    console.log(`Pool created, pool address is: ${poolAddress}`);

    // Step 3: Get the pool ID
    console.log("Getting pool ID...");
    const poolId = await getPoolIdFromJelly(signer, poolAddress);
    console.log(`Pool ID: ${poolId}`);

    return `Successfully created pool. Pool ID: ${poolId}, Pool Address: ${poolAddress}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error in createPool: ${errorMsg}`);
    throw error;
  }
}

/**
 * Validates pool parameters to ensure they are valid
 * @param tokensForPool Tokens to add to the pool
 * @param fee Pool fee percentage
 */
function validatePoolParams(
  tokensForPool: {
    tokenSymbol: string;
    address: string;
    amount: number;
    weight: number;
    decimals: number;
  }[], 
  fee: number
): void {
  // Check if tokens are provided
  if (!tokensForPool || tokensForPool.length === 0) {
    throw new Error("No tokens provided for pool creation");
  }

  // Check if fee is within valid range (0.01% to 2%)
  if (fee < 0.0001 || fee > 0.02) {
    throw new Error("Fee must be between 0.01% and 2%");
  }

  // Check if sum of weights equals 100
  const totalWeight = tokensForPool.reduce((sum, token) => sum + token.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.001) { // Allow a small rounding error
    throw new Error("Sum of token weights must equal 100");
  }
}
