/**
 * Preset hardware and raw material dimensions for leather manufacturing CRM.
 * Used by the Matrix Variant Generator to instantly generate multi-variant SKUs
 * (e.g. Zippers, Pullers, Thread, Edge Paint, Rivets, Buckles).
 */

export const STANDARD_SIZES = [
    { label: '#3 (Small / Pockets)', value: '#3' },
    { label: '#5 (Standard / Main)', value: '#5' },
    { label: '#8 (Heavy Duty / Luggage)', value: '#8' },
    { label: '#10 (Extra Heavy)', value: '#10' },
];

export const STANDARD_TYPES = [
    { label: 'Nickel / Silver', value: 'Nickel' },
    { label: 'Antique Brass / Metal', value: 'Antique Brass' },
    { label: 'Kata / Nylon Coil', value: 'Kata' },
    { label: 'Gunmetal / Black Nickel', value: 'Gunmetal' },
    { label: 'Gold / Polished Brass', value: 'Gold' },
    { label: 'Matte Black', value: 'Matte Black' },
];

export const STANDARD_LEATHER_COLORS = [
    { name: 'Black', hex: '#18181b', isDark: true },
    { name: 'Dark Brown', hex: '#3e2723', isDark: true },
    { name: 'Tan / Cognac', hex: '#b45309', isDark: false },
    { name: 'Camel', hex: '#c19a6b', isDark: false },
    { name: 'Chocolate', hex: '#4b3621', isDark: true },
    { name: 'Beige / Cream', hex: '#fef3c7', isDark: false },
    { name: 'Red', hex: '#dc2626', isDark: true },
    { name: 'Burgundy / Maroon', hex: '#800020', isDark: true },
    { name: 'Navy Blue', hex: '#1e3a8a', isDark: true },
    { name: 'Royal Blue', hex: '#2563eb', isDark: true },
    { name: 'Olive Green', hex: '#556b2f', isDark: true },
    { name: 'Forest Green', hex: '#15803d', isDark: true },
    { name: 'Grey / Charcoal', hex: '#4b5563', isDark: true },
    { name: 'White', hex: '#ffffff', isDark: false, hasBorder: true },
    { name: 'Rust / Terracotta', hex: '#b7410e', isDark: true },
    { name: 'Taupe', hex: '#8b8589', isDark: false },
    { name: 'Khaki', hex: '#d4c99e', isDark: false },
    { name: 'Teal', hex: '#0f766e', isDark: true },
    { name: 'Yellow', hex: '#eab308', isDark: false },
    { name: 'Orange', hex: '#ea580c', isDark: true },
    { name: 'Purple', hex: '#7e22ce', isDark: true },
    { name: 'Pink', hex: '#ec4899', isDark: false },
];
