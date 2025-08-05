# Tokamak ZK-EVM Airdrop Event Page

An airdrop event page for Tokamak Network ZK-EVM built with Next.js.

## 🚀 Key Features

- **Automated Figma Design Token Sync**: Automatically extract colors, fonts, spacing, etc. from designer's Figma files
- **Modern UI/UX**: Sophisticated design utilizing Tailwind CSS and Figma design system
- **Responsive Design**: Optimized experience for all devices from mobile to desktop
- **Airdrop Participation Features**: Complete airdrop flow including wallet connection, eligibility verification, and token claiming
- **Dark Mode Support**: Theme switching based on user preferences
- **TypeScript**: Enhanced type safety and developer experience

## 🎨 Design System

### Figma Integration

- **File**: [Figma Design File](https://www.figma.com/design/0R11fVZOkNSTJjhTKvUjc7/Ooo)
- **Automatic Token Extraction**: Auto-sync colors, typography, spacing, etc.
- **Real-time Updates**: Automatic reflection of Figma file changes

### Color Palette

- **Primary**: Tokamak brand colors (`tokamak-*`)
- **Secondary**: Airdrop event colors (`airdrop-*`)
- **Grayscale**: Grayscale system (`grayscale-*`)
- **Applied**: Applied surface colors (`applied-*`)

## 📦 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Design System**: Figma API Integration
- **State Management**: React Hooks
- **Development**: ESLint, Prettier

## 🛠️ Installation and Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd tokamak-zk-evm-airdrop
npm install
```

### 2. Setup Figma Design Tokens

```bash
# Set up Figma API token and file key
node setup-figma-quick.js

# Or manually create .env.local file
echo "FIGMA_TOKEN=your-figma-token" >> .env.local
echo "FIGMA_FILE_KEY=0R11fVZOkNSTJjhTKvUjc7" >> .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser to view the application.

## 📱 Page Structure

### Main Page

- **Header**: Navigation and wallet connection
- **Hero Section**: Main banner and CTA
- **Stats Section**: Airdrop statistics
- **Airdrop Section**: Airdrop participation cards
- **How It Works**: Participation guide
- **FAQ Section**: Frequently asked questions
- **Footer**: Links and social media

### Components

- `Header.tsx`: Top navigation
- `Hero.tsx`: Main hero section
- `Stats.tsx`: Statistics display
- `AirdropSection.tsx`: Airdrop card list
- `HowItWorks.tsx`: Participation guide
- `FAQ.tsx`: Expandable FAQ
- `Footer.tsx`: Footer information

## 🎯 Airdrop Features

### Participation Flow

1. **Wallet Connection**: Connect supported wallets like MetaMask
2. **Eligibility Check**: Automatic verification of participation conditions
3. **Token Application**: Select desired airdrop
4. **Approval Wait**: Review process
5. **Token Receipt**: Token transfer to wallet

### Airdrop Types

- **Early Adopter Bonus**: For early users (1,000 TON)
- **Developer Incentive**: For DApp developers (2,500 TON)
- **Community Participation**: Community activity rewards (500 TON)

## 🔧 Development Scripts

```bash
# Run development server
npm run dev

# Production build
npm run build

# Run production server
npm start

# Linting
npm run lint

# Sync Figma design tokens
npm run figma:sync

# Figma auto-watch mode
npm run figma:watch
```

## 🎨 Figma Integration

### Setup Instructions

1. [Generate Figma API Token](https://www.figma.com/developers/api#access-tokens)
2. Run `node setup-figma-quick.js`
3. Enter token to complete automatic setup

### Usage

```bash
# Manual sync
npm run figma:sync

# Auto-watch mode (real-time sync)
npm run figma:watch
```

### File Structure

```
design-system/
├── tokens/
│   └── tokens.json          # Design tokens extracted from Figma
├── components/
│   └── ...                  # Component definitions
figma-exports/
├── ...                      # Figma asset exports
```

## 🌐 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

- `FIGMA_TOKEN`: Figma API token
- `FIGMA_FILE_KEY`: Figma file key

## 📖 Coding Guidelines

### Style Rules

- **Code Comments**: Written in English
- **Variable/Function Names**: camelCase (English)
- **Component Names**: PascalCase
- **File Names**: kebab-case

### Tailwind CSS Rules

- Use utility-first approach
- Prioritize Figma design tokens
- Responsive design (mobile-first)
- Dark mode support

### TypeScript Rules

- Use strict mode
- Define types for all props
- Prefer Interface over Type

## 🤝 Contributing

1. Create or check existing issues
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## 📄 License

This project is distributed under the MIT License.

## 🔗 Links

- [Tokamak Network](https://tokamak.network)
- [Figma Design File](https://www.figma.com/design/0R11fVZOkNSTJjhTKvUjc7/Ooo)
- [Live Demo](https://tokamak-zk-evm-airdrop.vercel.app)

---

**Built with ❤️ by Tokamak Network Team**
