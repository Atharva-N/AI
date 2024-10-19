import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// src/components/AuthForm.js
import { auth } from '../firebase'; // Change this line to import auth correctly
// Import db if you are using it in this file


import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
} from 'firebase/auth';

const AuthForm = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [grecaptcha, setGrecaptcha] = useState(null);

    useEffect(() => {
        const loadRecaptcha = () => {
            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => setGrecaptcha(window.grecaptcha);
            document.body.appendChild(script);
        };
        loadRecaptcha();
    }, []);

    const toggleTab = () => {
        setIsLogin((prev) => !prev);
        setMessage('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
        return password.length >= minLength && hasNumber.test(password) && hasSpecialChar.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!grecaptcha) {
            setMessage('reCAPTCHA is loading...');
            return;
        }

        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            setMessage('Please complete the reCAPTCHA.');
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                localStorage.setItem('userEmail', userCredential.user.email);
                navigate('/home');
            } else {
                if (password !== confirmPassword) {
                    setMessage('Passwords do not match.');
                    return;
                }
                if (!validatePassword(password)) {
                    setMessage('Password must be at least 8 characters long, contain at least one digit, and one special character.');
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                localStorage.setItem('userEmail', userCredential.user.email);
                setIsLogin(true);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setMessage('Sign up successful! You can now log in.');
            }
        } catch (error) {
            const errorCode = error.code;
            switch (errorCode) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setMessage('Invalid credentials. Please try again.');
                    break;
                case 'auth/email-already-in-use':
                    setMessage('Email already in use. Please try a different one.');
                    break;
                default:
                    setMessage('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);

        try {
            const result = await signInWithPopup(auth, provider);
            localStorage.setItem('userEmail', result.user.email);
            navigate('/home');
        } catch (error) {
            let friendlyMessage = 'An error occurred during Google sign-in. Please try again.';

            if (error.code === 'auth/popup-closed-by-user') {
                friendlyMessage = 'The sign-in popup was closed. Please try again to log in with Google.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                friendlyMessage = 'The sign-in process was cancelled. Please try again.';
            } else {
                friendlyMessage = `Google sign-in error: ${error.message}`;
            }

            setMessage(friendlyMessage); // Display the user-friendly message
        } finally {
            setIsLoading(false);
        }
    };

    const forgotPassword = async () => {
        // No need for password input, only email is required.
        if (!email) {
            setMessage('Please enter your email address.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent. Please check your inbox.');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="container">
            <h2>Welcome</h2>
            <div className="tabs">
                <div className={`tab ${isLogin ? 'active' : ''}`} onClick={toggleTab}>
                    Login
                </div>
                <div className={`tab ${!isLogin ? 'active' : ''}`} onClick={toggleTab}>
                    Sign Up
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                {!isLogin && (
                    <>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                        />
                        <div className="signup-requirements">
                            <p>Password must be:</p>
                            <ul>
                                <li>At least 8 characters long</li>
                                <li>Contain at least one digit</li>
                                <li>Contain at least one special character</li>
                            </ul>
                        </div>
                    </>
                )}
                <div className="g-recaptcha" data-sitekey="6LfI70sqAAAAAMK7wc5vQ64kBVXDuvRcX1ePJG7k"></div>
                <div className="forgot-password">
                    {isLogin && (
                        <button
                            type="button" // Change to button to prevent form submission
                            onClick={forgotPassword}
                            style={{ background: 'none', color: 'blue', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                            Forgot Password?
                        </button>
                    )}
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLogin ? 'Login' : 'Sign Up'}
                </button>
            </form>
            <button className="google-button" onClick={signInWithGoogle} disabled={isLoading}>
                Sign in with Google
            </button>
            {message && <div id="message" className="error">{message}</div>}
        </div>
    );
};

export default AuthForm;
