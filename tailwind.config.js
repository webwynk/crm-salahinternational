import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.tsx',
    ],

    theme: {
        screens: {
            sm: '480px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
        extend: {
            colors: {
                brand: {
                    50: '#f2f6ff',
                    100: '#e6edff',
                    200: '#c2d3ff',
                    300: '#94b0ff',
                    400: '#5c85ff',
                    500: '#3b63f5', // primary
                    600: '#2c4bd1',
                    700: '#213aa6',
                    800: '#1a2e80',
                    900: '#141f57',
                },
                neutral: {
                    0: '#ffffff',
                    50: '#f8f9fb',
                    100: '#f1f2f5',
                    200: '#e4e6eb',
                    300: '#d1d5db',
                    400: '#9aa0ac',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2430',
                    900: '#12141a',
                },
                success: { 50: '#ecfdf3', 500: '#12b76a', 700: '#027a48' },
                warning: { 50: '#fffaeb', 500: '#f79009', 700: '#b54708' },
                danger: { 50: '#fef3f2', 500: '#f04438', 700: '#b42318' },
                info: { 50: '#eff8ff', 500: '#2e90fa', 700: '#175cd3' },
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', ...defaultTheme.fontFamily.sans],
            },
            borderRadius: {
                sm: '6px',
                md: '10px',
                lg: '16px',
            },
            boxShadow: {
                xs: '0 1px 2px rgba(16,24,40,0.05)',
                sm: '0 1px 3px rgba(16,24,40,0.10), 0 1px 2px rgba(16,24,40,0.06)',
                md: '0 4px 8px rgba(16,24,40,0.10)',
                lg: '0 12px 24px rgba(16,24,40,0.12)',
            },
        },
    },

    plugins: [forms],
};
