import * as fs from 'fs';
import * as path from 'path';

// Get the plugin name from command line arguments
const pluginName = process.argv[2];

if (!pluginName) {
    console.error('Error: Please provide a plugin name');
    console.log('Usage: npm run create-your-plugin <plugin-name>');
    process.exit(1);
}

// Define the plugin directory path
const toolsDir = path.join(process.cwd(), 'src', 'tools');
const pluginDir = path.join(toolsDir, pluginName);

// Basic index.ts template
const indexContent = `
export * from "./${pluginName}";
`;

// Basic tool.ts template
const toolContent = `
import { SeiAgentKit } from "../../index";

export async function ${pluginName}(agent: SeiAgentKit) {
    // implement your plugin logic here
}
`;

// Create the directory structure and file
try {
    // Ensure the src/tool directory exists
    if (!fs.existsSync(toolsDir)) {
        fs.mkdirSync(toolsDir, { recursive: true });
    }

    // Create the plugin directory
    if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir);
        console.log(`Created directory: ${pluginDir}`);
    } else {
        console.warn(`Directory already exists: ${pluginDir}`);
    }

    // Create the index.ts file
    const indexPath = path.join(pluginDir, 'index.ts');
    fs.writeFileSync(indexPath, indexContent);
    console.log(`Created file: ${indexPath}`);

    // Create the tool.ts file
    const toolPath = path.join(pluginDir, `${pluginName}.ts`);
    fs.writeFileSync(toolPath, toolContent);
    console.log(`Created file: ${toolPath}`);

    // Add export to src/tools/index.ts
    const toolsIndexPath = path.join(toolsDir, 'index.ts');
    if (fs.existsSync(toolsIndexPath)) {
        const exportStatement = `export * from "./${pluginName}";\n`;
        let toolsIndexContent = fs.readFileSync(toolsIndexPath, 'utf8');

        // Check if the export already exists to avoid duplicates
        if (!toolsIndexContent.includes(exportStatement.trim())) {
            fs.appendFileSync(toolsIndexPath, exportStatement);
            console.log(`Updated src/tools/index.ts with export for ${pluginName}`);
        } else {
            console.log(`Export for ${pluginName} already exists in src/tools/index.ts`);
        }
    } else {
        // Create the src/tools/index.ts file if it doesn't exist
        const toolsIndexContent = `export * from "./${pluginName}";\n`;
        fs.writeFileSync(toolsIndexPath, toolsIndexContent);
        console.log(`Created src/tools/index.ts with export for ${pluginName}`);
    }

    console.log(`\n✅ Successfully created ${pluginName} plugin!`);
    console.log(`You can now implement your plugin logic in src/tools/${pluginName}/${pluginName}.ts`);
} catch (error) {
    console.error('Error creating plugin:', error);
    process.exit(1);
} 