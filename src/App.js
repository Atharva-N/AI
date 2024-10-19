// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Home from './components/Home'; // Ensure you have a Home component
import './App.css';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthForm />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default App;
