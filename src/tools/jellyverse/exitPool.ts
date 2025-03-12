import { Contract, ethers } from "ethers";
import abi from "./jelly-docs/src/abis/vault.json";
import { contracts } from "./jelly-docs/src/helpers/contracts";
import { SeiAgentKit } from "../../agent";
import { TokenData } from "./jelly-docs/src/helpers/generatePoolCreateData";

/**
 * Exit a Jellyverse token pool
 * @param agent SeiAgentKit instance
 * @param poolId ID of the pool to exit
 * @param tokensForPool Array of token configurations for the pool
 * @param bptAmountIn Amount of BPT (Balancer Pool Token) to redeem
 * @returns Promise with transaction hash
 */
export async function exitPool(
  agent: SeiAgentKit,
  poolId: string,
  tokensForPool: {
    tokenSymbol: string;
    address: string;
    amount: number; // Minimum amount expected to receive when exiting
    weight: number;
    decimals: number;
  }[],
  bptAmountIn: string // Amount of pool tokens to redeem
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

    // Create contract instance
    const vaultContract = new Contract(contracts.vault, abi, signer);

    // Get token addresses and minimum amounts expected to receive
    const assets = formattedTokens.map(token => token.address);
    const minAmountsOut = formattedTokens.map(token => 
      ethers.utils.parseUnits(String(token.amount), token.decimals).toString()
    );

    // Define exit kind - EXACT_BPT_IN_FOR_TOKENS_OUT is the most common
    const exitKind = 1; // Equivalent to PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT

    // Prepare the exit data
    const exitData = {
      assets,
      minAmountsOut,
      userData: ethers.utils.defaultAbiCoder.encode(
        ["uint8", "uint256"], 
        [exitKind, ethers.utils.parseEther(bptAmountIn)]
      ),
      toInternalBalance: false,
    };
    
    // Set a manual gas limit to bypass the gas estimation error
    const options = {
      gasLimit: 30000
    };
    
    // Execute the exit transaction
    const exitPoolTx = await vaultContract.exitPool(
      poolId,
      agent.wallet_address,
      agent.wallet_address,
      exitData,
      options
    );
    
    await exitPoolTx.wait();

    return `Successfully exited pool. Transaction hash: ${exitPoolTx.hash}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error in exitPool: ${errorMsg}`);
    throw error;
  }
}
