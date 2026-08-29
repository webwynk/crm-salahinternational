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
                // Amber/Bronze — primary accent for leather goods manufacturing
                brand: {
                    50:  '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#d97706', // primary — rich amber
                    600: '#b45309', // hover
                    700: '#92400e', // active / dark
                    800: '#78350f',
                    900: '#451a03',
                },
                neutral: {
                    0:   '#ffffff',
                    50:  '#f8f7f4', // warm off-white (matches leather aesthetic)
                    100: '#f0ede8',
                    200: '#e2ddd6',
                    300: '#ccc5ba',
                    400: '#a89f94',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                },
                success: {
                    50:  '#ecfdf3',
                    100: '#d1fadf',
                    200: '#a6f4c5',
                    300: '#6ce9a6',
                    400: '#32d583',
                    500: '#12b76a',
                    600: '#039855',
                    700: '#027a48',
                    800: '#05603a',
                    900: '#054f31',
                },
                warning: {
                    50:  '#fffaeb',
                    100: '#fef0c7',
                    200: '#fedf89',
                    300: '#fec84b',
                    400: '#fdb022',
                    500: '#f79009',
                    600: '#dc6803',
                    700: '#b54708',
                    800: '#93370d',
                    900: '#7a2e0e',
                },
                danger: {
                    50:  '#fef3f2',
                    100: '#fee4e2',
                    200: '#fecdca',
                    300: '#fda29b',
                    400: '#f97066',
                    500: '#f04438',
                    600: '#d92d20',
                    700: '#b42318',
                    800: '#912018',
                    900: '#7a271a',
                },
                info: {
                    50:  '#eff8ff',
                    100: '#d1e9ff',
                    200: '#b2ddff',
                    300: '#84caff',
                    400: '#53b1fd',
                    500: '#2e90fa',
                    600: '#1570ef',
                    700: '#175cd3',
                    800: '#1849a9',
                    900: '#194185',
                },
            },
            fontFamily: {
                sans: ['"DM Sans"', 'Inter var', 'Inter', 'ui-sans-serif', 'system-ui', ...defaultTheme.fontFamily.sans],
                display: ['"DM Sans"', 'Inter', 'sans-serif'],
                mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            },
            fontVariantNumeric: {
                tabular: 'tabular-nums',
            },
            fontSize: {
                '2xs': ['11px', { lineHeight: '16px' }],
                xs:   ['12px', { lineHeight: '16px' }],
                sm:   ['13px', { lineHeight: '18px' }],
                base: ['14px', { lineHeight: '20px' }],
                md:   ['16px', { lineHeight: '24px' }],
                lg:   ['18px', { lineHeight: '26px' }],
                xl:   ['22px', { lineHeight: '30px' }],
                '2xl':['28px', { lineHeight: '36px' }],
            },
            borderRadius: {
                sm:   '6px',
                md:   '10px',
                lg:   '16px',
                full: '9999px',
            },
            boxShadow: {
                xs: '0 1px 2px rgba(28,25,23,0.05)',
                sm: '0 1px 3px rgba(28,25,23,0.10), 0 1px 2px rgba(28,25,23,0.06)',
                md: '0 4px 8px rgba(28,25,23,0.10)',
                lg: '0 12px 24px rgba(28,25,23,0.12)',
            },
            spacing: {
                18: '72px',
                60: '240px',
            },
        },
    },

    plugins: [forms],
};
