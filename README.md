# Contributors:
* Felipe M. Panugan III - NeoRedcraft
* Nicholas D. Pastiu - yikkN
* Karrin Frida Novero - Rin1803
* Dwayne Umali - RDwayneUmali
* Jacob Shen Riesgo - JacobShenRiesgo


# Project Structure Overview

This project is a React-based web application initialized with Vite, using Supabase for authentication.

## File and Folder Breakdown

### `App_dev_lab-project` (Root)
- **README.md**: Contains the list of contributors and this project overview.
- **proj-docs/**: Documentation directory.
  - `usertesting_securitylogin.md`: Detailed guide on user testing, Supabase integration, and security features.

### `my-app` (Frontend Application)
This is the main React application directory.
- **package.json**: Manages project dependencies (React, Supabase client, etc.) and scripts (`npm run dev`).
- **vite.config.ts**: Configuration for the Vite build tool.
- **.gitignore**: Specifies which files Git should ignore (e.g., `node_modules`, `.env`).
- **index.html**: The main entry point HTML file.

#### `src/` (Source Code)
- **main.tsx**: The entry point for React. It finds the root element in `index.html` and renders the `App`.
- **App.tsx**: The root component. It currently handles rendering the `LoginPage`.
- **components/**: Contains modular React components.
  - **Login/**: Self-contained Login module.
    - `LoginPage.tsx`: The UI and logic for the login form, including validation and Supabase interaction.
    - `Login.css`: Dedicated styling for the login page.
    - `supabaseClient.ts`: Configuration file for the Supabase client connection.
