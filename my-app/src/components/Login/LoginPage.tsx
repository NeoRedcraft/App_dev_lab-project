import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './Login.css';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        if (!email.endsWith('@mymail.mapua.edu.ph')) {
            return 'Invalid Email';
        }
        return '';
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (value && !value.endsWith('@mymail.mapua.edu.ph')) {
            // Optional: You can validate on change or on blur. 
            // For a strict UX, maybe just clear error when they start typing again, 
            // but let's keep it simple and validate on submit or blur.
            // Here I'll clear the error if they are typing to avoid annoying messages while typing
            if (emailError) setEmailError('');
        }
    };

    const handleBlur = () => {
        if (email) {
            setEmailError(validateEmail(email));
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errorMsg = validateEmail(email);
        if (errorMsg) {
            setEmailError(errorMsg);
            return;
        }

        // Proceed with login logic
        console.log('Logging in with:', { email, password });

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Error logging in:', error.message);
            alert(`Login failed: ${error.message}`);
        } else {
            console.log('Logged in:', data);
            alert(`Login successful for user: ${data.user.email}`);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Student Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleBlur}
                            placeholder="username"
                            required
                        />
                        {emailError && <div className="error-message">{emailError}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
