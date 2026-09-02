export const BASE_UNITS = [
    { value: 'sq_ft', label: 'Square Feet (sq_ft)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'in', label: 'Inch (in)' },
    { value: 'yard', label: 'Yard (yard)' },
    { value: 'feet', label: 'Feet (feet)' },
    { value: 'sq m', label: 'Square Meter (sq m)' },
    { value: 'sq_dm', label: 'Square Decimeter (sq_dm)' },
    { value: 'hides', label: 'Hides / Sides (hides)' },
    { value: 'cm2', label: 'Square Centimeter (cm2)' },
    { value: 'g', label: 'Gram (g)' },
];

export const VALID_UNIT_VALUES = BASE_UNITS.map((u) => u.value);
