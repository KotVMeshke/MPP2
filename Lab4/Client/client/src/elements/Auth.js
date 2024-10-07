import React, { useState } from 'react';
import "./Auth.css";

const Auth = ({ setIsAuthenticated, sendMessage}) => {
    const [authPage, setAuthPage] = useState('login');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (method) => {
        const requestParams = {
            Method: method.toUpperCase(), 
            TaskId: 0,
            TypeOfRequest: null,
            UserName: userName,
            AccessToken: null, 
            FileName: null
        };

        const requestPayload = {
            Param1: userName,
            Param2: password,
            Param3: null, 
            Param4: null
        };

        sendMessage(JSON.stringify(requestParams), JSON.stringify(requestPayload), null);
        localStorage.setItem('user', userName);
    }


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
                        <button onClick={() => handleAuth('AUTH')}>Login</button>
                        <p>Don't have an account?{' '}
                            <button onClick={() => setAuthPage('register')}>Register</button>
                        </p>
                    </>
                ) : (
                    <>
                        <button onClick={() => handleAuth('REG')}>Register</button>
                        <p>Already have an account?{' '}
                            <button onClick={() => setAuthPage('login')}>Login</button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Auth;
