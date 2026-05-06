import React, { useState } from 'react';
import Input from './Input';

export default function PasswordInput({ buttonStyle, ...props }) {
    const [showPassword, setShowPassword] = useState(false);

    const toggleButton = (
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
                position: 'absolute',
                right: '12px',
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary-blue, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                margin: '0',
                height: '100%',
                zIndex: 10,
                ...buttonStyle
            }}
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
            {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
            )}
        </button>
    );

    return (
        <Input
            {...props}
            type={showPassword ? 'text' : 'password'}
            rightElement={toggleButton}
        />
    );
}