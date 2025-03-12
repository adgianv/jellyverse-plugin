import {Contract, ethers} from "ethers";
import abi from "./abis/vault.json";
import {contracts} from "./helpers/contracts";
import {TokenData} from "./helpers/generatePoolCreateData";
import generatePoolJoinData from "./helpers/generatePoolJoinData";

const joinPool = async (signer: any, poolId: string, userAddress: `0x${string}` | string, tokensForPool: TokenData[]): Promise<string> => {
    const vaultContract = new Contract(contracts.vault, abi, signer);

    const {
        joinKind,
        maxAmountsIn,
        assets,
        nativeTokenValue
    } = await generatePoolJoinData(signer, poolId, tokensForPool);

    let joinPool;

    const joinData = {
        assets,
        maxAmountsIn,
        userData: ethers.utils.defaultAbiCoder.encode(["uint8", "uint256[]"], [joinKind, maxAmountsIn]),
        fromInternalBalance: false,
    };
    
    // Set a manual gas limit to bypass the gas estimation error
    const options = {
        gasLimit: 30000
    };
    
    if (nativeTokenValue) {
        // Create a combined options object with nativeTokenValue
        const combinedOptions = Object.assign({}, options, nativeTokenValue);
        joinPool = await vaultContract.joinPool(
            poolId, 
            userAddress, 
            userAddress, 
            joinData, 
            combinedOptions
        );
    } else {
        joinPool = await vaultContract.joinPool(
            poolId, 
            userAddress, 
            userAddress, 
            joinData, 
            options
        );
    }
    
    await joinPool?.wait();

    return joinPool.hash;
}

export default joinPool;

