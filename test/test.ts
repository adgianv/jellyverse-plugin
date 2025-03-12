import { SeiAgentKit } from "../src";
import * as dotenv from "dotenv";

dotenv.config();

function validateEnvironment(): void {
  const missingVars: string[] = [];
  const requiredVars = ["SEI_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

validateEnvironment();


const agent = new SeiAgentKit(
  process.env.SEI_PRIVATE_KEY!,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  },
);
async function main(
  contract?: string) {
  try {
    agent.joinPool("0x9b9ba5d3d14d1b6c1d4562f981bb2e3afc91a2b00002000000000000000000fc", [
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
        address: "0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1",
        amount: 0.000002, 
        weight: 100,
        decimals: 6
      }
    ]);

  }
 catch (err) {
    console.error(err);
    return null;
  }
}


if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}