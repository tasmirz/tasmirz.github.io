# Portfolio CSS Organization

## File Structure

The CSS for this portfolio site is organized using a modular approach for better maintainability:

### Base Layer
- `base.css`: Contains foundational styles, CSS variables, resets, and utility classes

### Theming Layer
- `colors.css`: All color-related variables and basic color applications
- `dark-theme.css`: Dark mode color overrides

### Components Layer
- `components.css`: Reusable UI components like buttons, typography styles, etc.

### Layout Layer
- `layout.css`: Page structure, grid systems, and positioning

### Animation Layer
- `animation.css`: All animations, transitions, keyframes, and interactive effects

### Responsive Layer
- `tablet.css`: Tablet-specific styles (481px to 768px)
- `phone.css`: Mobile-specific styles (up to 480px)

## CSS Variables

The system uses CSS variables for:
- Colors
- Spacing
- Typography
- Border radiuses

**Note**: Transition variables have been moved to `animation.css` for better organization.

## Naming Conventions

- BEM-influenced class naming (Block__Element--Modifier)
- Descriptive variable names (e.g., `--color-primary` rather than `--c1`)
- Section IDs use lowercase names (`#welcome`, `#about`)

## Animation Organization

All animation-related code is centralized in `animation.css`:
- **Keyframes**: @keyframes definitions for complex animations
- **Transitions**: Hover effects and state changes
- **Transforms**: Scale, translate, and rotate effects
- **Scroll Animations**: Future implementation of scroll-triggered animations
- **Responsive Animations**: Performance optimizations for mobile devices
- **Accessibility**: Reduced motion support for users who prefer it

## Responsive Design

- Mobile-first approach in some areas
- Device-specific overrides for layout and spacing
- Media queries organized in separate files
- Animation performance optimizations for mobile

## Best Practices Used

- CSS organization by purpose (separation of concerns)
- Proper use of CSS variables
- Eliminated code duplication
- Consistent commenting and sectioning
- Centralized animation management
- Accessibility considerations (prefers-reduced-motion)
- Performance optimizations for mobile devices

## Load Order

The CSS files are loaded in the following order in `index.html`:
1. `base.css` - Foundation
2. `colors.css` - Color system
3. `dark-theme.css` - Dark mode
4. `components.css` - UI components
5. `layout.css` - Page structure
6. `animation.css` - Interactive effects
7. `tablet.css` - Tablet responsive
8. `phone.css` - Mobile responsive
- Minimal use of !important (restricted to mobile overrides only)
- Single source of truth for component styling
