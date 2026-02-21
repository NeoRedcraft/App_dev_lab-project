import React, { useState } from "react";
import { supabase } from "../../database/client";
import "./Login.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    if (!value.endsWith("@mymail.mapua.edu.ph")) return "Invalid Email";
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) setEmailError("");
  };

  const handleBlur = () => {
    if (email) setEmailError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateEmail(email);
    if (errorMsg) {
      setEmailError(errorMsg);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error logging in:", error.message);
      alert(`Login failed: ${error.message}`);
    } else {
      console.log("Logged in:", data);
      alert(`Login successful for user: ${data.user.email}`);
    }
  };

  return (
    <div className="login-bg">
      {/* red overlay tint */}
      <div className="login-overlay" />

      <div className="login-wrap">
        <div className="login-card2">
          <img src="/images/logo.png" alt="Login Logo" className="login-logo2" />

          <form onSubmit={handleSubmit} className="login-form2">
            <div className="field">
              <div className="field-label">Enter your email here</div>
              <input
                type="email"
                className="field-input"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                placeholder="Email"
                required
              />
              {emailError && <div className="field-error">{emailError}</div>}
            </div>

            <div className="field">
              <div className="field-label">Enter your Password</div>
              <input
                type="password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            <button type="submit" className="login-btn2">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
