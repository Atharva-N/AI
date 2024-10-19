// src/components/Recaptcha.js
import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Recaptcha = ({ onChange }) => {
    return (
        <ReCAPTCHA
            sitekey="6LfI70sqAAAAAMK7wc5vQ64kBVXDuvRcX1ePJG7k"  // Replace with your site key
            onChange={onChange}
        />
    );
};

export default Recaptcha;
