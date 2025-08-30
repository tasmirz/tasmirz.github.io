# Portfolio Website Documentation

## Project Overview

This is a personal portfolio website for Tasmir Hossain Zihad, designed to showcase skills, projects, and contact information. The site features a modern, responsive design with interactive elements including a typewriter effect, theme toggle, and an immersive "My Life" section with WebGL-powered exploration capabilities.

## Technology Stack

- **HTML5**: Semantic structure and content
- **CSS3**: Styling with variables, flexbox, aspect ratios, and media queries
- **JavaScript ES6+**: Interactive elements, animations, and game logic
- **WebGL 2.0**: Custom shaders and texture rendering
- **GLSL**: Fragment and vertex shaders for visual effects
- **Material Icons**: Icon system for UI elements

## Features

- **Responsive Design**: Adapts to desktop, tablet, and mobile viewports
- **Dark/Light Theme**: User-togglable theme preference with system detection
- **Typewriter Effect**: Dynamic text animation on the homepage
- **WebGL Background**: Interactive custom background effects
- **Interactive "My Life" Section**:
  - Explorable 2D world with texture-based backgrounds
  - WASD keyboard controls for desktop navigation
  - Mobile gameboy-style touch controls
  - 4:3 aspect ratio gaming viewport
  - Real-time character positioning and world scrolling
- **Social Media Links**: Integrated social platform buttons
- **Mobile Navigation**: Hamburger menu for smaller screens
- **Touch-Optimized**: Full touch support for mobile gaming experience

## File Structure

```
├── index.html            # Main HTML document
├── README.md             # Project documentation
├── DOCUMENTATION.md      # Detailed documentation
├── css/                  # CSS files
│   ├── base.css          # Foundation styles and variables
│   ├── colors.css        # Color definitions
│   ├── components.css    # Reusable UI components
│   ├── dark-theme.css    # Dark mode styling
│   ├── layout.css        # Page structure and positioning
│   ├── phone.css         # Mobile styles with game controls
│   ├── tablet.css        # Tablet styles
│   └── README.md         # CSS organization documentation
├── js/                   # JavaScript files
│   ├── main.js           # Main application logic
│   ├── scroll-events.js  # Scroll-based interactions
│   ├── ui-events.js      # User interface event handlers
│   ├── webgl-background.js # WebGL background implementation
│   ├── webgl-core.js     # Core WebGL utilities
│   ├── webgl-lyf.js      # "My Life" interactive game engine
│   ├── webgl-tile-game.js # WebGL tile game component
│   └── WEBGL-DOCS.md     # WebGL documentation
├── shaders/              # GLSL shader files
│   ├── basic.frag        # Basic fragment shader
│   ├── basic.vert        # Basic vertex shader
│   ├── color.frag        # Color fragment shader
│   ├── color.vert        # Color vertex shader
│   ├── lyf.frag          # "My Life" fragment shader with texture mapping
│   └── lyf.vert          # "My Life" vertex shader
└── assets/               # Game assets
    └── lyf.png           # Background texture for exploration
```

## Interactive Game Controls

### "My Life" Section

The portfolio includes an interactive exploration game in the "My Life" section:

#### Desktop Controls

- **W**: Move view up
- **A**: Move view left
- **S**: Move view down
- **D**: Move view right
- **Click**: Focus the game canvas

#### Mobile Controls (Game Boy Style)

- **D-Pad**: Touch-based directional controls
  - ▲ (Up button)
  - ▼ (Down button)
  - ◀ (Left button)
  - ▶ (Right button)
- **Action Button (●)**: Reset position to center
- **Touch**: All controls support touch events

#### Game Features

- **4:3 Aspect Ratio**: Classic gaming viewport
- **Texture Exploration**: Navigate through a zoomed view of life imagery
- **Character Indicator**: Cyan dot shows current position
- **Smooth Movement**: Real-time world scrolling
- **Cross-Platform**: Same experience on desktop and mobile

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build step or server is required for basic viewing
4. For development, use a local server to avoid CORS issues with assets

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Responsive Breakpoints

- **Desktop**: 769px and above
- **Tablet**: 481px to 768px
- **Mobile**: 480px and below

## JavaScript Components

- **Typewriter Effect**: Animated text display in the welcome section
- **Theme Toggle**: Switches between light and dark themes
- **Mobile Menu**: Hamburger menu for mobile navigation
- **Scroll Events**: Animations and effects triggered by scrolling
- **WebGL Background**: Interactive canvas background
- **WebGL Game Engine**: "My Life" interactive exploration system
  - Real-time texture rendering
  - Cross-platform input handling
  - Smooth character movement
  - Mobile touch optimization

## WebGL Implementation

The portfolio uses custom WebGL implementations for both background effects and interactive gaming:

- **Background Effects**: See `js/WEBGL-DOCS.md` for details
- **Game Engine**: `webgl-lyf.js` powers the "My Life" exploration
- **Shader System**: Custom GLSL shaders for visual effects
- **Texture Management**: Efficient loading and rendering of game assets

## CSS Organization

See `css/README.md` for detailed information on the CSS organization and structure.

## Future Improvements

- Add project filtering functionality
- Implement contact form with validation
- Add page transitions
- Optimize WebGL performance further
- Add localization support

#Game

will clip with css as tile like
