import React, { useState } from 'react';
import "./Auth.css";

const Auth = ({ setIsAuthenticated }) => {
    const [authPage, setAuthPage] = useState('login');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const res = await fetch('https://localhost:7121/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, password }),
            credentials: 'include'
        });

        if (res.ok) {
            setIsAuthenticated(true);
        } else {
            alert('Login failed');
        }
    };

    const handleRegister = async () => {
        const res = await fetch('https://localhost:7121/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, password }),
            credentials: 'include'
        });

        if (res.ok) {
            setIsAuthenticated(true);
        } else {
            alert('Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>{authPage === 'login' ? 'Login' : 'Register'}</h2>
            <input
                type="text"
                placeholder="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div className='buttons'>
                {authPage === 'login' ? (
                    <>
                        <button onClick={handleLogin}>Login</button>
                        <p>
                            Don't have an account?{' '}

                            <button onClick={() => setAuthPage('register')}>Register</button>
                        </p>
                    </>
                ) : (
                    <>
                        <button onClick={handleRegister}>Register</button>
                        <p>
                            Already have an account?{' '}

                            <button onClick={() => setAuthPage('login')}>Login</button>
                        </p>
                    </>
                )}
            </div>

        </div>
    );
};

export default Auth;
