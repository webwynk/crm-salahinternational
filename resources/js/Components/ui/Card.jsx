import React from 'react';

export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-white border border-neutral-200 rounded-md shadow-xs p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
