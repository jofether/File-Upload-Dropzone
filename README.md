# File Upload Dropzone

A semantic UI component focused on Border Semantics for file uploads. The dashed border is a universal signifier for "Drop Files Here," training users to distinguish between solid containers (cards) and dashed interactive zones.

## Project Structure

- **src/App.jsx** - Main application component featuring the dropzone UI
- **src/main.jsx** - Entry point for the React application
- **src/index.css** - Tailwind CSS imports

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5173`

### Build

```bash
npm run build
```

Builds the production-optimized version in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Design Rationale

The layout focuses on Border Semantics:
- **Dashed borders** = Interactive dropzone areas
- **Solid borders** = Static card containers

This distinction trains the model/user to understand the purpose of different UI elements at a glance.

## Future Considerations

The code includes a comment for a future bug: "Change 'border-dashed' to 'border-solid' or remove it entirely" - This is intentional for testing semantic understanding.
