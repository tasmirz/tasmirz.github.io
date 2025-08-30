# Portfolio Website Redesign

A modern portfolio website for Tasmir Hossain Zihad featuring interactive WebGL elements, responsive design, typewriter effect, theme toggling, and an interactive "My Life" section with gameboy-style controls.

## Live Demo

[View the portfolio](https://zihad.dev) (placeholder URL - update with your actual domain)

![Portfolio Screenshot](https://via.placeholder.com/800x400?text=Portfolio+Screenshot) (placeholder - replace with actual screenshot)

## Project Structure

```
Portfolio/Redesign/
├── css/
│   ├── base.css          # Foundation styles, variables, and resets
│   ├── colors.css        # Color variables and applications
│   ├── components.css    # Reusable UI components
│   ├── dark-theme.css    # Dark theme color overrides
│   ├── layout.css        # Page structure and positioning
│   ├── phone.css         # Mobile-specific styles (≤480px)
│   ├── tablet.css        # Tablet-specific styles (481px-768px)
│   └── README.md         # CSS organization documentation
├── js/
│   ├── main.js           # Entry point for JS initialization
│   ├── ui-events.js      # Theme toggle and mobile menu handlers
│   ├── scroll-events.js  # Scroll-based interactions
│   ├── webgl-background.js # WebGL background implementation
│   ├── webgl-core.js     # WebGL utilities and core classes
│   ├── webgl-lyf.js      # Interactive "My Life" WebGL game
│   ├── webgl-tile-game.js # WebGL tile game component
│   └── WEBGL-DOCS.md     # WebGL documentation
├── shaders/
│   ├── basic.vert        # Basic vertex shader with texture support
│   ├── basic.frag        # Basic fragment shader with texture support
│   ├── color.vert        # Color vertex shader
│   ├── color.frag        # Color fragment shader
│   ├── lyf.vert          # Vertex shader for "My Life" section
│   └── lyf.frag          # Fragment shader for "My Life" section
├── assets/
│   └── lyf.png           # Background texture for "My Life" section
├── DOCUMENTATION.md      # Comprehensive project documentation
└── index.html            # Main HTML structure
```

## Key Features

## Features

- 🎨 Dark/Light theme toggle
- 📱 Fully responsive design
- ⚡ Smooth animations and transitions
- 🎮 Interactive WebGL background
- 🎯 Game-like experience in "My Life" section
- 📊 Interactive project showcase
- 💻 Clean, modern design

## CSS Organization

The CSS has been refactored for better maintainability:

- **Base Layer**: Foundation styles, variables, resets, and utility classes
- **Theming Layer**: Color variables and theme-specific overrides
- **Components Layer**: Reusable UI components and patterns
- **Layout Layer**: Page structure and positioning
- **Responsive Layer**: Device-specific adaptations

See `css/README.md` for detailed documentation on CSS organization.

## JavaScript Architecture

- **Modular Design**: Separate files for different responsibilities
- **Event Handling**: Clean implementation of UI and scroll events
- **WebGL Framework**: Custom WebGL implementation with program and context classes
- **Interactive Game Engine**: "My Life" section with:
  - WASD keyboard controls for desktop
  - Touch-enabled gameboy-style D-pad for mobile
  - Texture-based world exploration
  - Real-time WebGL rendering with custom shaders
- **Animation**: Smooth animations and transitions

See `js/WEBGL-DOCS.md` for details on the WebGL implementation.

## Interactive Controls

### Desktop Controls

- **WASD Keys**: Navigate through the "My Life" world
  - W: Move up
  - S: Move down
  - A: Move left
  - D: Move right

### Mobile Controls (Game Boy Style)

- **D-Pad**: Touch controls for movement
  - ▲ (Up button)
  - ▼ (Down button)
  - ◀ (Left button)
  - ▶ (Right button)
- **Action Button (●)**: Reset position to center

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser or use a local server

```bash
# Using Python to create a simple HTTP server
npx live-server --port=3000
```

3. Open `http://localhost:8000` in your browser

## Development

### Prerequisites

- Modern web browser with WebGL support
- Text editor or IDE (VS Code recommended)
- Basic knowledge of HTML, CSS, and JavaScript

### Making Changes

1. CSS changes should follow the organization structure in `css/README.md`
2. WebGL modifications should reference `js/WEBGL-DOCS.md`
3. Test all changes across multiple devices and browsers

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Future Enhancements

- [ ] Add project filtering and categories
- [ ] Implement contact form with validation
- [ ] Enhance "My Life" game with more interactions
- [ ] Add more WebGL mini-games and visual effects
- [ ] Implement world boundaries and collision detection
- [ ] Add sound effects and background music
- [ ] Create achievement system for interactive sections
- [ ] Add sound effects and background music
- [ ] Create additional explorable areas
- [ ] Improve accessibility features
- [ ] Add page transitions and animations
- [ ] Implement localization support

## Comprehensive Documentation

For more detailed information about the project, see the `DOCUMENTATION.md` file.

## License

AGPLv3

# DataBase

a keyval
and a projects
and skills
another one for feedbacks and contact
