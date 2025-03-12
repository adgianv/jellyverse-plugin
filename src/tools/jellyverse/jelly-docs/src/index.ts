import "dotenv/config";

import createPool from "./createPool";
import getPoolId from "./getPoolId";
import joinPool from "./joinPool";
import addApprovals from "./addApprovals";
import {contracts} from "./helpers/contracts";
import {ethers} from "ethers";

const main = async () => {
    // >>>>> CHANGEABLE DATA <<<<<
    const tokensForPool = [
        {
            tokenSymbol: "fastUSD",
            address: "0x37a4dD9CED2b19Cfe8FAC251cd727b5787E45269", // mainnet
            // address: "0xB218459C01F94974AAA1c5B25d11E7758A02b0A1", // testnet
            amount: 0,
            weight: 0,
            decimals: 18
        },
        {
            tokenSymbol: "USDC",
            address: "0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1", // Using ethers v5 syntax
            // address: "0xd63b330615C6591164f418fc522510f3D9A8Eb67", // testnet
            amount: 0.000002,
            weight: 100,
            decimals: 6
        },
    ];
    const fee = 0.01; // 2 <= fee => 0.01
    const poolName = "Test Pool Name Sei"; // Name can be anything
    // >>>>> CHANGEABLE DATA <<<<<

    try {
        const privateKey = process.env.PRIVATE_KEY as string;
        const provider = new ethers.providers.JsonRpcProvider(contracts.rpc);
        const signer = new ethers.Wallet(privateKey, provider);
        const userAddress = await signer.getAddress();

        console.log("Creating pool...")
        const poolAddress = await createPool(signer, poolName, tokensForPool, fee, userAddress);
        console.log(`Pool created, pool address is: ${poolAddress}.`);

        console.log("Getting pool id...")
        const poolId = await getPoolId(signer, poolAddress);
        console.log(`Received pool id: ${poolId}.`);

        console.log("Approving tokens...")
        const approvals = await addApprovals(signer, tokensForPool)
        console.log(`All tokens are approved - ${approvals}`);

        console.log("Joining in pool....")
        const txHash = await joinPool(signer, poolId, userAddress, tokensForPool);
        console.log(`Successfully joined in pool, hash: ${txHash}`);
    } catch (e) {
        console.error(e)
    }
}

main().then();