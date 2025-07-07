# Figma to Tailwind Integration

This project includes automatic Figma to Tailwind CSS configuration sync.

## Setup

1. Get your Figma API token:
   - Go to https://www.figma.com/developers/api#access-tokens
   - Generate a new token

2. Get your Figma file key:
   - Open your Figma file
   - Copy the file key from the URL: `https://www.figma.com/file/[FILE_KEY]/...`

3. Run the setup script:
   ```bash
   npm run figma:setup
   ```

## Usage

### Manual Sync
```bash
npm run figma:sync
```

### Watch Mode (Auto-sync)
```bash
npm run figma:watch
```

## File Structure

```
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
```

## Environment Variables

Create a `.env.local` file with:

```
FIGMA_TOKEN=your-figma-token-here
FIGMA_FILE_KEY=your-file-key-here
```

## Customization

You can customize the color extraction and token generation by modifying the `figma-to-tailwind.js` script.

## Troubleshooting

- Make sure your Figma file is accessible with the provided token
- Check that your file key is correct
- Ensure you have proper network access to Figma API
