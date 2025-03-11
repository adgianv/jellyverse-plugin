# Cambrian - Plugin Development

<div align="center">
  <pre>
  ███████╗███████╗██╗      █████╗  ██████╗ ███████╗███╗   ██╗████████╗    ██╗  ██╗██╗████████╗
  ██╔════╝██╔════╝██║     ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝    ██║ ██╔╝██║╚══██╔══╝
  ███████╗█████╗  ██║     ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║       █████╔╝ ██║   ██║   
  ╚════██║██╔══╝  ██║     ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║       ██╔═██╗ ██║   ██║   
  ███████║███████╗██║     ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║       ██║  ██╗██║   ██║   
  ╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝       ╚═╝  ╚═╝╚═╝   ╚═╝   
  </pre>
  <h4>Plugin Development Template for Cambrian</h4>
</div>


<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</p>

## 🚀 Introduction

This repository is a starter kit for developers who want to build plugins for Cambrian. It provides a simplified workflow to create custom integrations for protocols and services on the SEI blockchain.

## 📋 Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- npm
- Basic understanding of TypeScript and blockchain concepts

### Installation

1. Fork this repository:
   - Click the "Fork" button in the top right to create your personal copy

2. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/cambrian-plugin.git
   cd cambrian-plugin
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## 🛠️ Creating Your First Plugin

### 1. Use the Plugin Generator

Run the provided script to create a new plugin structure:

```bash
npm run create-your-plugin your-plugin-name
```

This will:
- Create a directory at `src/tools/your-plugin-name/`
- Generate an `index.ts` file that exports your plugin functions
- Create a template function file (`your-plugin-name.ts`)
- Update the main tools index to include your plugin

### 2. Plugin Structure

After running the generator, you'll have:

```
src/tools/your-plugin-name/
├── index.ts              # Exports all functions from your plugin
└── your-plugin-name.ts   # Implementation of your plugin functionality
```

### 3. Implement Your Plugin Logic

Edit the generated `your-plugin-name.ts` file to implement your specific functionality:

```typescript
import { SeiAgentKit } from "../../index";

/**
 * Performs some action with your protocol
 * @param agent SeiAgentKit instance
 * @param param1 Description of parameter
 * @returns Result data or transaction hash
 */
export async function yourPluginName(
  agent: SeiAgentKit,
  param1: string  // Add any parameters your function needs
): Promise<any> {
  // Implement your logic here
  
  // Example: Connect to a protocol, make a transaction, etc.
  
  return { success: true, message: "Operation completed" };
}
```

### 4. Add Additional Functions (Optional)

If your plugin needs multiple functions, create new files for each major operation:

```bash
touch src/tools/your-plugin-name/anotherFunction.ts
```

Then implement the function and export it in your plugin's `index.ts`:

```typescript
// In index.ts
export * from "./your-plugin-name";
export * from "./anotherFunction";
```

## 📌 Best Practices

### Function Design

1. **Clear naming**: Use descriptive function names that indicate the action
2. **Input validation**: Always validate input parameters
3. **Error handling**: Implement proper error handling with informative messages
4. **Documentation**: Include JSDoc comments for all functions

### Code Example

```typescript
import { SeiAgentKit } from "../../index";

/**
 * Stakes tokens in the protocol
 * @param agent SeiAgentKit instance
 * @param amount Amount to stake (in full tokens, not micro)
 * @returns Transaction hash
 */
export async function stakeTokens(
  agent: SeiAgentKit,
  amount: number
): Promise<string> {
  // 1. Input validation
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${amount}. Must be a positive number.`);
  }

  try {
    // 2. Your implementation
    // ...

    // 3. Return result
    return "tx_hash_here";
  } catch (error) {
    // 4. Error handling
    console.error(`Error in stakeTokens: ${error}`);
    throw error;
  }
}
```

## 🧪 Testing Your Plugin

### 1. Set Up Environment Variables

Before testing your plugin, you need to set up your environment variables:

1. Copy the example environment file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your SEI wallet private key:
   ```
   SEI_PRIVATE_KEY=your_private_key_here
   ```
   
   > ⚠️ **IMPORTANT**: Never commit your `.env` file with your private key to version control.

### 2. Import Your Tool in SeiAgentKit

After creating your plugin, you need to integrate it with the SeiAgentKit class. Edit `src/agent/index.ts`:

```typescript
// 1. Import your plugin function(s)
import { yourPluginName } from '../tools/your-plugin-name';

export class SeiAgentKit {
  // Existing properties and methods...
  
  // 2. Add a method that wraps your plugin function
  async yourPluginMethod(param1: string): Promise<any> {
    return yourPluginName(this, param1);
  }
}
```

### 3. Add a Test Case

Update the test file at `test/test.ts` to call your new method:

```typescript
import { SeiAgentKit } from "../src";
import * as dotenv from "dotenv";

dotenv.config();

// Environment validation and setup...

const agent = new SeiAgentKit(
  process.env.SEI_PRIVATE_KEY!,
  {
    OPENAI_API_KEY: "",
  },
);

async function main(contract?: string) {
  try {
    // Test your plugin function
    console.log("Testing your plugin...");
    const result = await agent.yourPluginMethod("test parameter");
    console.log("Result:", result);
  } catch (err) {
    console.error("Error testing plugin:", err);
    return null;
  }
}

// Execute the test...
```

### 4. Run the Test

Execute your test using the provided npm script:

```bash
npm run test
```

This will:
- Run your test.ts file with tsx
- Execute your plugin function
- Display the results in the console

### 5. Debugging Tips

- Check console logs for any errors
- Verify that your method is correctly importing and calling your plugin function
- Ensure all required parameters are passed correctly
- For blockchain interactions, consider using a testnet environment first

## 🔄 Plugin Integration Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│     Step 1    │     │     Step 2    │     │     Step 3    │
│  Fork & Clone │────▶│  Run Plugin   │────▶│  Implement    │
│  Repository   │     │  Generator    │     │  Functions    │
└───────────────┘     └───────────────┘     └───────────────┘
                                                    │
                                                    ▼
                      ┌───────────────┐     ┌───────────────┐
                      │     Step 5    │     │     Step 4    │
                      │  Submit Pull  │◀────│  Test Your    │
                      │  Request      │     │  Plugin       │
                      └───────────────┘     └───────────────┘
```
## 📤 Submitting Your Plugin

Once you've completed and tested your plugin, submit it for inclusion in the Cambrian ecosystem:

1. **Push your changes** to your fork
2. **Submit a pull request** with a clear description of your plugin's functionality and use cases

Our team will review your submission and handle the integration process. We may reach out for clarification or suggest improvements before merging.

When submitting your pull request, please include:
- A brief description of what your plugin does
- Any dependencies it requires


## 🔗 Links

- [Cambrian](https://x.com/cambrian_ai)
- [SEI Blockchain](https://www.sei.io/)

---

<div align="center">
  <p>Building on SEI with Cambrian </p>
</div> 
