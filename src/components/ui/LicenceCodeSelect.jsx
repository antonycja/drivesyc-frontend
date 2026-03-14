'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/**
 * SA licence codes in NRTA order with their legacy Code numbers.
 */
export const LICENCE_CODE_OPTIONS = [
    { value: 'A1', label: 'A1 — Motorcycle (up to 125cc)' },
    { value: 'A',  label: 'A — Motorcycle (any)' },
    { value: 'B',  label: 'B — Motor vehicle (Code 8)' },
    { value: 'EB', label: 'EB — Motor vehicle + trailer (Code 8 + trailer)' },
    { value: 'C1', label: 'C1 — Heavy motor vehicle (<16 000kg)' },
    { value: 'EC1',label: 'EC1 — Heavy motor vehicle + trailer (<16 000kg)' },
    { value: 'C',  label: 'C — Heavy motor vehicle (Code 10)' },
    { value: 'EC', label: 'EC — Heavy motor vehicle + trailer (Code 14)' },
];

/**
 * Returns the option object for a given licence code value, or undefined.
 * @param {string} code
 */
export function getLicenceCodeOption(code) {
    return LICENCE_CODE_OPTIONS.find((o) => o.value === code);
}

/**
 * Returns true when the given code requires an E-code endorsement (trailer).
 * @param {string} code
 */
export function codeCanTowHeavy(code) {
    return ['EB', 'EC1', 'EC'].includes(code);
}

/**
 * shadcn Select wrapper for SA licence codes.
 *
 * @param {{ value: string, onChange: (value: string) => void, disabled?: boolean, required?: boolean }} props
 */
export default function LicenceCodeSelect({ value, onChange, disabled = false, required = false }) {
    return (
        <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
            required={required}
        >
            <SelectTrigger>
                <SelectValue placeholder="Select licence code" />
            </SelectTrigger>
            <SelectContent>
                {LICENCE_CODE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
