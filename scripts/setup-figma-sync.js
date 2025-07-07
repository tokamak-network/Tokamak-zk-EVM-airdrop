#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * Interactive Figma to Tailwind Setup Script
 *
 * This script helps users set up automatic Figma to Tailwind conversion
 * with interactive prompts and environment variable configuration.
 */

class FigmaSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Prompt user for input
   */
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Create .env.local file with Figma credentials
   */
  createEnvFile(figmaToken, fileKey) {
    const envContent = `# Figma API Configuration
FIGMA_TOKEN=${figmaToken}
FIGMA_FILE_KEY=${fileKey}
`;

    fs.writeFileSync(".env.local", envContent);
    console.log("✅ Environment file created: .env.local");
  }

  /**
   * Create package.json scripts for Figma sync
   */
  updatePackageJson() {
    const packagePath = "package.json";

    if (!fs.existsSync(packagePath)) {
      console.log("⚠️  package.json not found. Creating basic package.json...");
      const basicPackage = {
        name: "tokamak-zk-evm-airdrop",
        version: "1.0.0",
        private: true,
        scripts: {},
        dependencies: {},
        devDependencies: {},
      };
      fs.writeFileSync(packagePath, JSON.stringify(basicPackage, null, 2));
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    // Add Figma sync scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "figma:sync":
        "node scripts/figma-to-tailwind.js $FIGMA_TOKEN $FIGMA_FILE_KEY",
      "figma:setup": "node scripts/setup-figma-sync.js",
      "figma:watch": "node scripts/figma-watch.js",
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Package.json updated with Figma sync scripts");
  }

  /**
   * Create Figma watch script for automatic updates
   */
  createWatchScript() {
    const watchScriptContent = `#!/usr/bin/env node

const chokidar = require('chokidar');
const { exec } = require('child_process');

console.log('👀 Watching for Figma file changes...');
console.log('Press Ctrl+C to stop watching\\n');

// Watch for changes in design system files (you can customize this)
const watcher = chokidar.watch(['./design-system/**/*', './figma-exports/**/*'], {
  ignored: /node_modules/,
  persistent: true
});

let syncing = false;

watcher.on('change', (path) => {
  if (!syncing) {
    syncing = true;
    console.log(\`📁 File changed: \${path}\`);
    console.log('🔄 Syncing with Figma...');
    
    exec('npm run figma:sync', (error, stdout, stderr) => {
      if (error) {
        console.error(\`❌ Error: \${error.message}\`);
      } else {
        console.log(stdout);
        console.log('✅ Figma sync completed!');
      }
      syncing = false;
    });
  }
});

// Manual sync every 5 minutes (optional)
setInterval(() => {
  if (!syncing) {
    console.log('🔄 Periodic sync...');
    exec('npm run figma:sync', (error, stdout, stderr) => {
      if (error) {
        console.error(\`❌ Periodic sync error: \${error.message}\`);
      } else {
        console.log('✅ Periodic sync completed!');
      }
    });
  }
}, 5 * 60 * 1000); // 5 minutes
`;

    fs.writeFileSync("scripts/figma-watch.js", watchScriptContent);
    console.log("✅ Figma watch script created");
  }

  /**
   * Create design system structure
   */
  createDesignSystemStructure() {
    const dirs = [
      "design-system",
      "design-system/tokens",
      "design-system/components",
      "figma-exports",
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create design tokens template
    const tokensTemplate = {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          900: "#4c1d95",
        },
      },
      typography: {
        fontFamily: {
          sans: ["Inter", "system-ui", "sans-serif"],
          display: ["Inter", "system-ui", "sans-serif"],
        },
        fontSize: {
          xs: ["0.75rem", { lineHeight: "1rem" }],
          sm: ["0.875rem", { lineHeight: "1.25rem" }],
          base: ["1rem", { lineHeight: "1.5rem" }],
          lg: ["1.125rem", { lineHeight: "1.75rem" }],
          xl: ["1.25rem", { lineHeight: "1.75rem" }],
          "2xl": ["1.5rem", { lineHeight: "2rem" }],
        },
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
      },
    };

    fs.writeFileSync(
      "design-system/tokens/tokens.json",
      JSON.stringify(tokensTemplate, null, 2)
    );

    console.log("✅ Design system structure created");
  }

  /**
   * Create README for Figma integration
   */
  createReadme() {
    const readmeContent = `# Figma to Tailwind Integration

This project includes automatic Figma to Tailwind CSS configuration sync.

## Setup

1. Get your Figma API token:
   - Go to https://www.figma.com/developers/api#access-tokens
   - Generate a new token

2. Get your Figma file key:
   - Open your Figma file
   - Copy the file key from the URL: \`https://www.figma.com/file/[FILE_KEY]/...\`

3. Run the setup script:
   \`\`\`bash
   npm run figma:setup
   \`\`\`

## Usage

### Manual Sync
\`\`\`bash
npm run figma:sync
\`\`\`

### Watch Mode (Auto-sync)
\`\`\`bash
npm run figma:watch
\`\`\`

## File Structure

\`\`\`
design-system/
├── tokens/
│   └── tokens.json          # Design tokens extracted from Figma
├── components/
│   └── ...                  # Component definitions
figma-exports/
├── ...                      # Exported assets from Figma
scripts/
├── figma-to-tailwind.js     # Main conversion script
├── setup-figma-sync.js      # Interactive setup
└── figma-watch.js           # Watch mode script
\`\`\`

## Environment Variables

Create a \`.env.local\` file with:

\`\`\`
FIGMA_TOKEN=your-figma-token-here
FIGMA_FILE_KEY=your-file-key-here
\`\`\`

## Customization

You can customize the color extraction and token generation by modifying the \`figma-to-tailwind.js\` script.

## Troubleshooting

- Make sure your Figma file is accessible with the provided token
- Check that your file key is correct
- Ensure you have proper network access to Figma API
`;

    fs.writeFileSync("FIGMA_INTEGRATION.md", readmeContent);
    console.log("✅ Figma integration README created");
  }

  /**
   * Main setup process
   */
  async setup() {
    console.log("🎨 Figma to Tailwind Setup\n");

    try {
      // Get Figma credentials
      const figmaToken = await this.prompt("Enter your Figma API token: ");
      const fileKey = await this.prompt("Enter your Figma file key: ");

      if (!figmaToken || !fileKey) {
        console.log("❌ Both Figma token and file key are required");
        process.exit(1);
      }

      console.log("\n🔧 Setting up Figma integration...\n");

      // Create environment file
      this.createEnvFile(figmaToken, fileKey);

      // Update package.json
      this.updatePackageJson();

      // Create watch script
      this.createWatchScript();

      // Create design system structure
      this.createDesignSystemStructure();

      // Create README
      this.createReadme();

      console.log("\n🎉 Figma integration setup completed!");
      console.log("\nNext steps:");
      console.log('1. Run "npm run figma:sync" to sync your Figma file');
      console.log('2. Run "npm run figma:watch" to enable auto-sync');
      console.log("3. Check FIGMA_INTEGRATION.md for more details");
    } catch (error) {
      console.error("❌ Setup failed:", error);
    } finally {
      this.rl.close();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new FigmaSetup();
  setup.setup();
}

module.exports = FigmaSetup;
