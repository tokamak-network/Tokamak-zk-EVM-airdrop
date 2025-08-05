# Tokamak ZK-EVM Airdrop - Coding Rules

## 📱 Responsive Design Rules

### Mobile Breakpoint

- **Mobile**: 1359px and below
- **Desktop**: 1360px and above

### Tailwind Classes

```css
/* Mobile-first approach */
.mobile-only {
  @apply block desktop:hidden;
}

.desktop-only {
  @apply hidden desktop:block;
}
```

### JavaScript Mobile Detection

```javascript
// Use this consistent check across all components
const isMobile = window.innerWidth <= 1359;

// For responsive navigation
const targetId = isMobile ? `${sectionId}-mobile` : sectionId;
```

### Mobile ID Naming Convention

- Desktop ID: `quest`, `proof-dashboard`, `faq`
- Mobile ID: `quest-mobile`, `proof-mobile`, `faq-mobile`

## 🎯 Navigation Rules

### Section ID Mapping

```javascript
// Navigation ID mapping for mobile components
const MOBILE_ID_MAP = {
  'quest': 'quest-mobile',
  'proof-dashboard': 'proof-mobile',
  'faq': 'faq-mobile'
};
```

### Scroll Function Pattern

```javascript
const scrollToSection = (sectionId: string) => {
  const isMobile = window.innerWidth <= 1359;

  let targetId = sectionId;
  if (isMobile) {
    switch (sectionId) {
      case 'quest':
        targetId = 'quest-mobile';
        break;
      case 'proof-dashboard':
        targetId = 'proof-mobile';
        break;
      case 'faq':
        targetId = 'faq-mobile';
        break;
      default:
        targetId = sectionId;
    }
  }

  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
```

## 💻 Component Rules

### Client Components

- Add `"use client"` for components with event handlers
- Always at the top of the file

### ID Assignment Rules

1. **Desktop components**: Use base IDs (`quest`, `proof-dashboard`, `faq`)
2. **Mobile components**: Use `-mobile` suffix (`quest-mobile`, `proof-mobile`, `faq-mobile`)
3. **Shared components**: Use conditional rendering with appropriate IDs

### Example Structure

```tsx
// Desktop Layout
<div id="quest" className="hidden desktop:flex">
  {/* Desktop content */}
</div>

// Mobile Layout
<div id="quest-mobile" className="desktop:hidden flex">
  {/* Mobile content */}
</div>
```

## 🎨 Styling Rules

### Tailwind Breakpoints

- `desktop:` prefix for 1360px and above
- `max-desktop:` prefix for 1359px and below
- Default styles should be mobile-first

### Color Usage

- Use design system colors from `tailwind.config.js`
- Prefer semantic color names over arbitrary values
- Follow existing color palette (tokamak, airdrop, etc.)

## 📝 Code Quality Rules

### TypeScript

- Always use TypeScript strict mode
- Define proper interfaces for all props
- Use meaningful variable names in English

### Comments

- All code comments in English
- Document complex logic and business rules
- Use JSDoc for function documentation

### File Naming

- Components: PascalCase (`Header.tsx`)
- Utilities: camelCase (`device.ts`)
- Configs: kebab-case (`tailwind.config.js`)

## 🚀 Performance Rules

### Component Optimization

- Use React.memo() for expensive components
- Implement proper loading states
- Avoid unnecessary re-renders

### Image Optimization

- Always use Next.js Image component
- Provide proper alt text
- Consider lazy loading for below-fold content

## 🔧 Development Workflow

### Commit Messages

- Use conventional commit format
- Write in English
- Be descriptive but concise

### Example:

```
feat: add responsive navigation with mobile-specific IDs
fix: resolve mobile scroll issue in FAQ component
style: update mobile breakpoint to 1359px
```
