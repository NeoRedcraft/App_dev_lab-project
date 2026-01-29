# Project User Testing and Security Guide

## Completed Tasks

### 1. Project Cleanup
- Cleaned up boilerplate code.
- Configured `.gitignore` for a cleaner repository.
- Verified initial "Hello, World" setup.

### 2. Login Page Implementation
- Created modular `LoginPage` component.
- Implemented email validation restricted to `@mymail.mapua.edu.ph`.
- Applied clean, centered styling.

## Verification

### Login Page Manual Test
1.  **Open** `http://localhost:5173/`.
2.  **Valid Email Test**:
    - Enter `student@mymail.mapua.edu.ph` and any password.
    - Click "Sign In".
    - Expected: Alert "Login attempted for: student@mymail.mapua.edu.ph".
3.  **Invalid Email Test**:
    - Enter `student@gmail.com`.
    - Click "Sign In" or click out of the input.
    - Expected: Error message "Email must be a valid @mymail.mapua.edu.ph address".

## Supabase Integration Guide

To connect this login form to Supabase later, follow these steps:

### 1. Install Supabase Client
Run this in your terminal:
```bash
npm install @supabase/supabase-js
```

### 2. Set up Supabase Client
Create `src/components/Login/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Update LoginPage.tsx
Replace the console log in `handleSubmit` with:
```typescript
import { supabase } from './supabaseClient'

// ... inside handleSubmit
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})

if (error) console.error('Error logging in:', error.message)
else console.log('Logged in:', data)
```

## How to Find Your Supabase Credentials

To fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `src/supabaseClient.ts`:

1.  **Go to your Project Dashboard**: Log in to [Supabase](https://supabase.com/dashboard) and select your project.
2.  **Open Settings**: Click the **Settings** icon (cogwheel) at the bottom of the left sidebar.
3.  **Select API**: Click on **API** in the configuration menu.
4.  **Find Project URL**: Copy the URL under the **Project URL** section. This is your `supabaseUrl`.
5.  **Find API Keys**: Look for the **Project API keys** section.
    - Copy the key labeled `anon` `public`. **This is your `supabaseAnonKey`.**
    - *Note*: Do not use the `service_role` key on the client side (frontend).

> [!IMPORTANT]
> **Understanding School Accounts vs. Supabase Accounts**
> 
> You **cannot** log in with your actual school credentials (using your real school password) unless you implement **SSO (Single Sign-On)** or OAuth with Microsoft/Google, which is a more advanced setup.
>
> For **testing purposes**, Supabase treats your project as its own isolated system. To test efficiently:
> 1.  Use your school email address (e.g., `student@mymail.mapua.edu.ph`) as the username.
> 2.  **Create a NEW password** specifically for this app in the Supabase Dashboard (see below).
> 3.  This allows you to simulate the experience of a school user logging in, without needing access to the school's actual authentication servers.

## Manually Adding Users in Supabase (For Testing)

To test the login functionality with actual data (once connected), you have two options in the Supabase Dashboard > Authentication > Users:

### Option A: Create User (Recommended for Testing)
This is the easiest way to test your "Sign In with Password" form.
1.  Click **Add User** -> **Create New User**.
2.  Enter the email (e.g., `student@mymail.mapua.edu.ph`) and a **known password**.
3.  Ensure "Auto Confirm User" is checked.
4.  **Result**: You can immediately go to your app (`http://localhost:5173`) and log in with that email and password.

### Option B: Invite User (Advanced)
If you want to test the email flow:
1.  Click **Add User** -> **Invite User**.
2.  Enter the email.
3.  **Action**: Check that specific email inbox. You will receive an invitation link.
4.  **Next Steps**:
    -   Clicking the link will redirect you to your app.
    -   **Important**: Since our current app *only* has a Login screen and no "Set Password" screen, clicking the link establishes a session but **does not set a password**.
    -   To test the *Login Form* afterwards, you would still need a password.
    -   *Conclusion*: **Use Option A** unless you plan to build a "Update Password" page in your React app.

## Supabase Security Features

Supabase provides enterprise-grade security features out of the box. Here is how it protects your application:

### 1. Protection Against SQL Injection
SQL Injection occurs when malicious SQL statements are inserted into an entry field for execution.
-   **Structure**: The `supabase-js` client uses **PostgREST** under the hood. Not a direct connection to the database.
-   **Mechanism**: PostgREST uses **parameterized queries** for all requests. This means your input (e.g., the email or password) is treated strictly as data, never as executable code.
-   **Result**: It is mathematically impossible for a standard SQL injection attack to succeed through the Supabase client because the input is sanitized and isolated from the query structure.

### 2. Secure Authentication
-   **Passwords**: Supabase naturally salts and hashes passwords using industry-standard algorithms (bcrypt) before storing them. Actual passwords are never stored in plain text.
-   **Tokens**: When you log in, Supabase issues a **JWT (JSON Web Token)**. This standardized token is used for subsequent requests, removing the need to send credentials repeatedly.

### 3. Row Level Security (RLS)
While "Authentication" checks *who you are*, "Authorization" checks *what you can see*.
-   Supabase uses PostgreSQL's native **Row Level Security**.
-   You can write policies like: "Users can only modify their OWN profile data."
-   This ensures that even if you have valid credentials, you cannot access data you aren't supposed to see.