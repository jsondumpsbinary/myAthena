# myAthena --- Desktop Test Application

A desktop-based test application built with **Electron and React**.
myAthena provides a focused test-taking environment with a countdown
timer, webcam preview, periodic photo capture, and full-screen support.

The application combines a web-based user interface with desktop
capabilities provided by Electron.

------------------------------------------------------------------------

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Application Architecture](#application-architecture)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Running the Application](#running-the-application)
-   [Camera and Photo Capture](#camera-and-photo-capture)
-   [Full-Screen Mode](#full-screen-mode)
-   [Building the Application](#building-the-application)
-   [Project Structure](#project-structure)
-   [Design Theme](#design-theme)
-   [Privacy and Security](#privacy-and-security)
-   [Troubleshooting](#troubleshooting)
-   [Future Improvements](#future-improvements)
-   [Contributing](#contributing)
-   [License](#license)

------------------------------------------------------------------------

## Overview

myAthena is a desktop application developed using Electron and React.

The application includes a test countdown, webcam preview, periodic
camera capture, and a controlled full-screen experience. The project
also explores communication between the React renderer and Electron's
main process through IPC (Inter-Process Communication).

### Project Goals

-   Build a desktop application using Electron and React.
-   Understand communication between the renderer and main processes.
-   Create a focused test-taking interface.
-   Integrate webcam access and periodic photo capture.
-   Store captured photos locally.
-   Package the application for macOS.

------------------------------------------------------------------------

## Features

### 1. Test Countdown

The application includes a countdown timer before the test begins.

-   Displays the remaining time before the test starts.
-   Keeps the **Start Test** button disabled while the countdown is
    active.
-   Enables the test flow when the countdown reaches zero, subject to
    the required camera state.

### 2. Webcam Preview

The application provides a webcam preview before or during the test.

-   Requests access to the user's camera.
-   Displays the live camera feed.
-   Uses a compact preview layout to avoid taking up too much screen
    space.
-   Supports a responsive camera preview.

### 3. Automatic Photo Capture

The application captures photos periodically using the webcam.

-   Captures a photo every 10 seconds.
-   Saves captured images locally.
-   Uses a writable storage location for packaged builds.
-   Logs photo-saving success and errors in the console.

The camera preview is only a visual representation of the camera feed.
Changing its dimensions does not change the resolution of the captured
image.

### 4. Full-Screen Test Experience

The application supports a focused full-screen mode.

-   Provides an **Enter Full Screen** action.
-   Requests confirmation before entering full-screen mode.
-   Uses Electron IPC to communicate with the main process.
-   Includes a confirmation flow before quitting through `Cmd + Q` on
    macOS.

### 5. Local Photo Storage

Captured photos are stored locally on the user's machine.

  Environment            Photo Storage
  ---------------------- -----------------------------------------
  Development            Project's `photos/` directory
  Packaged application   Electron's `userData/photos/` directory

Using the `userData` directory allows the packaged application to save
photos without attempting to write inside the application's installation
directory.

------------------------------------------------------------------------

## Tech Stack

  Technology         Purpose
  ------------------ ---------------------------------------------------
  Electron           Desktop application framework
  React              User interface development
  Vite               Frontend development server and build tooling
  JavaScript         Application logic
  CSS                Styling and responsive layout
  Electron IPC       Communication between renderer and main processes
  Web APIs           Webcam access and media stream handling
  Electron Builder   Packaging and distribution

> The exact versions of these dependencies are defined in the project's
> `package.json`.

------------------------------------------------------------------------

## Application Architecture

The application follows the Electron desktop architecture.

``` text
myAthena
│
├── Electron Main Process
│   ├── Creates the application window
│   ├── Handles full-screen requests
│   ├── Handles application quit confirmation
│   └── Manages desktop-level functionality
│
├── Preload Script
│   └── Exposes selected Electron APIs to React
│
└── React Renderer Process
    ├── Test interface
    ├── Countdown timer
    ├── Camera preview
    ├── Automatic photo capture
    └── User interactions
```

### Electron Main Process

The main process manages the desktop application window and
operating-system-level functionality, including:

-   Creating the `BrowserWindow`.
-   Handling full-screen requests.
-   Managing application lifecycle events.
-   Displaying native confirmation dialogs.

### Preload Script

The preload script provides a controlled bridge between the renderer
process and Electron.

The React frontend can request specific functionality through the
exposed API without directly accessing the entire Electron API.

For example:

``` javascript
window.electronAPI.requestFullScreen();
```

The preload script forwards the request to the Electron main process
using IPC.

### React Renderer Process

The renderer process contains the user interface. It is responsible for:

-   Displaying the countdown.
-   Managing the test interface.
-   Displaying the webcam preview.
-   Handling camera capture logic.
-   Responding to user interactions.

------------------------------------------------------------------------

## Prerequisites

Before running the project, ensure that the following tools are
installed:

-   Node.js
-   npm
-   Git
-   A webcam for camera-related functionality

Check your installed versions:

``` bash
node -v
npm -v
git --version
```

------------------------------------------------------------------------

## Getting Started

### 1. Clone the Repository

``` bash
git clone https://github.com/jsondumpsbinary/myAthena.git
```

### 2. Navigate to the Project

``` bash
cd myAthena
```

### 3. Install Dependencies

``` bash
npm install
```

This installs the dependencies defined in `package.json`.

------------------------------------------------------------------------

## Running the Application

### Development Mode

Start the application using the development script:

``` bash
npm run dev
```

This starts the application in development mode.

If the project uses separate frontend and Electron scripts, refer to the
scripts defined in `package.json`.

### Build the Frontend

To create a production frontend build:

``` bash
npm run build
```

The generated frontend output is typically placed in the `dist/`
directory when using Vite.

------------------------------------------------------------------------

## Camera and Photo Capture

The application uses the webcam to display a live preview and capture
photos.

### Camera Access

The application requires camera permission from the operating system.

If camera access is denied, the camera preview and photo capture
functionality may not work as expected.

### Photo Capture Flow

``` text
Camera Permission
       |
       v
Camera Stream Starts
       |
       v
Live Preview Displayed
       |
       v
Capture Photo Every 10 Seconds
       |
       v
Save Photo Locally
       |
       v
Log Success or Error
```

### Photo Storage

In development, photos are saved inside the project's `photos/`
directory.

In a packaged application, photos are stored under:

``` text
app.getPath('userData')/photos
```

This is a writable location managed by Electron for application-specific
user data.

------------------------------------------------------------------------

## Full-Screen Mode

The application provides a full-screen experience for test-taking.

The full-screen flow is designed to:

1.  Allow the user to request full-screen mode.
2.  Display a confirmation dialog.
3.  Enter full-screen mode if the user confirms.
4.  Keep the test interface focused.
5.  Display a confirmation dialog before quitting through `Cmd + Q` on
    macOS.

Full-screen behavior is managed through Electron's main process and
exposed to the frontend through the preload bridge.

------------------------------------------------------------------------

## Building the Application

The project uses Electron Builder to package the desktop application.

### Build for macOS

Run the build command configured in the project:

``` bash
npm run build
```

If the project has a separate Electron Builder script, use the
corresponding command defined in `package.json`.

A packaged macOS build may include:

-   A `.app` application bundle.
-   A `.dmg` installer.
-   Build metadata files.

### Generated Build Files

Generated build files are typically stored in the `release/` directory.

These files are local build artifacts and should not be committed to
Git.

------------------------------------------------------------------------

## Project Structure

The exact structure may vary depending on the current implementation. A
typical structure for this project is:

``` text
myAthena/
│
├── electron/
│   ├── main.cjs
│   └── preload.cjs
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
│
├── photos/
├── public/
├── release/
├── package.json
├── package-lock.json
├── vite.config.js
├── index.html
├── .gitignore
└── README.md
```

### Important Directories

  Directory     Description
  ------------- ---------------------------------------
  `electron/`   Electron main and preload scripts
  `src/`        React frontend source code
  `public/`     Static assets
  `photos/`     Development photo storage
  `release/`    Generated packaged application builds

------------------------------------------------------------------------

## Design Theme

The application uses a green, black, and white colour palette.

  Colour            Hex Code    Usage
  ----------------- ----------- ------------------------------------
  Primary Green     `#22C55E`   Buttons, highlights, active states
  Dark Background   `#0B0F0C`   Main application background
  Card Background   `#151B16`   Cards and content sections
  White             `#F8FAFC`   Headings and primary text
  Secondary Text    `#A1A1AA`   Supporting text
  Border            `#2A352C`   Component borders

The design aims to provide a minimal and focused interface for
test-taking.

------------------------------------------------------------------------

## Privacy and Security

The application uses the webcam and stores captured photos locally.

Users should be aware of the following:

-   Camera access requires permission.
-   Captured photos are saved on the local machine.
-   The application should clearly communicate when camera access is
    active.
-   Captured photos should be handled responsibly.
-   Photo storage should be protected from unintended access.

The application should not be considered a complete proctoring or
anti-cheating system without additional verification, security, and
monitoring features.

------------------------------------------------------------------------

## Troubleshooting

### Camera Is Not Working

1.  Ensure the application has camera permission.
2.  Verify that the webcam is connected.
3.  Close other applications that may be using the camera.
4.  Restart the application.

### Photos Are Not Being Saved

Check the console for photo capture or file-system errors.

For packaged builds, ensure the application is using a writable
directory such as Electron's `userData` path.

### Full-Screen Button Is Not Working

Check that:

-   The preload script exposes the full-screen API.
-   The React frontend calls the correct API.
-   The IPC handler is registered in the Electron main process.
-   The main and preload scripts are loaded correctly.

### GitHub Rejects the Push

Packaged Electron applications can contain large binary files.

Avoid committing generated build output such as:

``` text
node_modules/
dist/
release/
photos/
```

These directories should generally be included in `.gitignore`.

------------------------------------------------------------------------

## Future Improvements

Potential future improvements include:

-   Test question and answer management.
-   Multiple test configurations.
-   Test result summaries.
-   Persistent test progress.
-   Improved camera status indicators.
-   Configurable countdown duration.
-   Better error handling.
-   Cross-platform packaging for Windows and Linux.
-   Application settings and preferences.
-   Secure storage and management of captured photos.

------------------------------------------------------------------------

**Built with Electron, React, and curiosity.**
