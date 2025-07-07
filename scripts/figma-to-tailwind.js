#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Figma to Tailwind CSS Config Generator
 *
 * This script extracts design tokens from Figma files and generates
 * a Tailwind CSS configuration file automatically.
 */

class FigmaToTailwind {
  constructor(figmaToken, fileKey) {
    this.figmaToken = figmaToken;
    this.fileKey = fileKey;
    this.baseUrl = "https://api.figma.com/v1";
  }

  /**
   * Fetch Figma file data
   */
  async fetchFigmaFile() {
    try {
      const response = await fetch(`${this.baseUrl}/files/${this.fileKey}`, {
        headers: {
          "X-Figma-Token": this.figmaToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching Figma file:", error);
      throw error;
    }
  }

  /**
   * Extract color tokens from Figma styles
   */
  extractColors(figmaData) {
    const colors = {};

    // Extract colors from styles
    if (figmaData.styles) {
      Object.values(figmaData.styles).forEach((style) => {
        if (style.styleType === "FILL") {
          const colorName = this.sanitizeStyleName(style.name);
          // This would need actual color extraction logic
          // For now, we'll use placeholder structure
          colors[colorName] = {
            50: "#f8fafc",
            100: "#f1f5f9",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            900: "#0f172a",
          };
        }
      });
    }

    return colors;
  }

  /**
   * Extract typography tokens
   */
  extractTypography(figmaData) {
    const typography = {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["Monaco", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
    };

    // Extract text styles if available
    if (figmaData.styles) {
      Object.values(figmaData.styles).forEach((style) => {
        if (style.styleType === "TEXT") {
          // Extract font information
          const styleName = this.sanitizeStyleName(style.name);
          // Add custom font size mappings here
        }
      });
    }

    return typography;
  }

  /**
   * Extract spacing tokens
   */
  extractSpacing(figmaData) {
    return {
      px: "1px",
      0: "0",
      0.5: "0.125rem",
      1: "0.25rem",
      1.5: "0.375rem",
      2: "0.5rem",
      2.5: "0.625rem",
      3: "0.75rem",
      3.5: "0.875rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      7: "1.75rem",
      8: "2rem",
      9: "2.25rem",
      10: "2.5rem",
      11: "2.75rem",
      12: "3rem",
      14: "3.5rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      28: "7rem",
      32: "8rem",
      36: "9rem",
      40: "10rem",
      44: "11rem",
      48: "12rem",
      52: "13rem",
      56: "14rem",
      60: "15rem",
      64: "16rem",
      72: "18rem",
      80: "20rem",
      96: "24rem",
    };
  }

  /**
   * Sanitize style names for Tailwind config
   */
  sanitizeStyleName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Generate Tailwind config object
   */
  generateTailwindConfig(figmaData) {
    const colors = this.extractColors(figmaData);
    const typography = this.extractTypography(figmaData);
    const spacing = this.extractSpacing(figmaData);

    return {
      content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            ...colors,
            tokamak: {
              50: "#f0f9ff",
              100: "#e0f2fe",
              500: "#0ea5e9",
              600: "#0284c7",
              700: "#0369a1",
              900: "#0c4a6e",
            },
            airdrop: {
              primary: "#6366f1",
              secondary: "#8b5cf6",
              accent: "#f59e0b",
            },
          },
          fontFamily: typography.fontFamily,
          fontSize: typography.fontSize,
          spacing: spacing,
          animation: {
            "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            "bounce-slow": "bounce 2s infinite",
            "fade-in": "fadeIn 0.5s ease-in-out",
            "slide-up": "slideUp 0.3s ease-out",
          },
          keyframes: {
            fadeIn: {
              "0%": { opacity: "0" },
              "100%": { opacity: "1" },
            },
            slideUp: {
              "0%": { transform: "translateY(20px)", opacity: "0" },
              "100%": { transform: "translateY(0)", opacity: "1" },
            },
          },
        },
      },
      plugins: [],
    };
  }

  /**
   * Save Tailwind config to file
   */
  saveTailwindConfig(config, outputPath = "./tailwind.config.js") {
    const configContent = `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(config, null, 2)};
`;

    fs.writeFileSync(outputPath, configContent);
    console.log(`✅ Tailwind config saved to ${outputPath}`);
  }

  /**
   * Main execution function
   */
  async generate() {
    try {
      console.log("🎨 Fetching Figma file...");
      const figmaData = await this.fetchFigmaFile();

      console.log("⚙️  Extracting design tokens...");
      const tailwindConfig = this.generateTailwindConfig(figmaData);

      console.log("💾 Saving Tailwind config...");
      this.saveTailwindConfig(tailwindConfig);

      console.log("🎉 Figma to Tailwind conversion completed!");
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: node figma-to-tailwind.js <FIGMA_TOKEN> <FILE_KEY>

Example:
  node figma-to-tailwind.js your-figma-token abc123def456

You can get your Figma token from:
https://www.figma.com/developers/api#access-tokens

File key can be found in your Figma URL:
https://www.figma.com/file/[FILE_KEY]/...
    `);
    process.exit(1);
  }

  const [figmaToken, fileKey] = args;
  const generator = new FigmaToTailwind(figmaToken, fileKey);
  generator.generate();
}

module.exports = FigmaToTailwind;
