export const BASE_UNITS = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'in', label: 'Inch (in)' },
    { value: 'yard', label: 'Yard (yard)' },
    { value: 'feet', label: 'Feet (feet)' },
    { value: 'sq m', label: 'Square Meter (sq m)' },
];

export const VALID_UNIT_VALUES = BASE_UNITS.map((u) => u.value);
