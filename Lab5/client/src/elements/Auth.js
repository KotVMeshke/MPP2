import React, { useState } from 'react';
import { gql, useMutation, ApolloClient, InMemoryCache } from '@apollo/client';

import "./Auth.css";


const userClient = new ApolloClient({
    uri: 'https://localhost:7292/user',
    cache: new InMemoryCache(),
});

const REGISTER_MUTATION = gql`
    mutation Register($username: String!, $password: String!) {
      register(username: $username, password: $password) {
        accessToken
      }
    }
`;

const LOGIN_MUTATION = gql`
    mutation Authorize($username: String!, $password: String!) {
      authorize(username: $username, password: $password) {
        accessToken
      }
    }
`;

const Auth = ({ setIsAuthenticated }) => {
    const [authPage, setAuthPage] = useState('login');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const [login, { loading: loginLoading, error: loginError }] = useMutation(LOGIN_MUTATION, {
        client: userClient
    });
    const [register, { loading: registerLoading, error: registerError }] = useMutation(REGISTER_MUTATION, {
        client: userClient
        
    });

    const handleLogin = async () => {
        try {
            const res = await login({ variables: { username: userName, password } });
            console.log(res);
            if (res.data.authorize.accessToken) {
                localStorage.setItem('jwtToken', res.data.authorize.accessToken)
                localStorage.setItem('username', userName);
                console.log(localStorage.getItem('jwtToken'));
                localStorage.setItem('isAuthenticated', true);
                setIsAuthenticated(true);
            }
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    const handleRegister = async () => {
        try {
            const res = await register({ variables: { username: userName, password } });
            if (res.data.register.accessToken) {
                localStorage.setItem('jwtToken', res.data.register.accessToken)
                localStorage.setItem('username', userName);
                localStorage.setItem('isAuthenticated', true);
                console.log(localStorage.getItem('jwtToken'));
                setIsAuthenticated(true);
            }
        } catch (err) {
            console.error("Registration failed:", err);
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
                        <button onClick={handleLogin} disabled={loginLoading}>
                            {loginLoading ? 'Logging in...' : 'Login'}
                        </button>
                        {loginError && <p className="error">Login failed: {loginError.message}</p>}
                        <p>
                            Don't have an account?{' '}
                            <button type="button" onClick={() => setAuthPage('register')}>Register</button>
                        </p>
                    </>
                ) : (
                    <>
                        <button onClick={handleRegister} disabled={registerLoading}>
                            {registerLoading ? 'Registering...' : 'Register'}
                        </button>
                        {registerError && <p className="error">Registration failed: {registerError.message}</p>}
                        <p>
                            Already have an account?{' '}
                            <button type="button" onClick={() => setAuthPage('login')}>Login</button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Auth;
