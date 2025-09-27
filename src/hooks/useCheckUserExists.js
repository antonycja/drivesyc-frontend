import { useState, useCallback } from "react";
import ApiProxy from '@/app/api/lib/proxy'


export default function useCheckUserExists() {
    const [existingUser, setExistingUser] = useState(null);
    const [checkingUser, setCheckingUser] = useState(false);
    const [checkField, setCheckField] = useState('');

    // Email validation helper
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Phone validation helper
    const isValidPhone = (phone) => {
        const cleanPhone = phone.replace(/[\s\+\-\(\)]/g, '');
        return cleanPhone.length >= 10; // Minimum 10 digits
    };

    const checkUserExists = useCallback(async (field, value) => {
        // Clear existing user if value is empty or too short
        if (!value || value.trim().length < 3) {
            setExistingUser(null);
            setCheckField('');
            return;
        }

        // Clear existing user if format is invalid
        if (field === 'email' && !isValidEmail(value)) {
            setExistingUser(null);
            setCheckField('');
            return;
        }

        if (field === 'phone' && !isValidPhone(value)) {
            setExistingUser(null);
            setCheckField('');
            return;
        }

        // Avoid redundant checks if value hasn't changed
        if (existingUser && checkField === field) {
            const currentValue = field === 'email'
                ? existingUser.email?.toLowerCase()
                : existingUser.phone?.replace(/[\s\+\-\(\)]/g, '');
            const newValue = field === 'email'
                ? value.toLowerCase()
                : value.replace(/[\s\+\-\(\)]/g, '');

            if (currentValue === newValue) return;
        }

        setCheckingUser(true);
        setCheckField(field);

        try {
            // Optional debounce
            await new Promise(resolve => setTimeout(resolve, 600));

            // Build query params
            const params = new URLSearchParams();
            if (field === 'email') params.append('email', value.trim());
            if (field === 'phone') params.append('phone', value.replace(/[\s\+\-\(\)]/g, ''));

            const {data, status} = await ApiProxy.get(`/api/users/check-exists?${params.toString()}`, true);
            // console.log("CHECK user: ", data);

            if (status === 200) {
                setExistingUser(data.exists ? data.user : null);
            } else {
                setExistingUser(null);
                console.error('Error checking user:', data.error);
            }
        } catch (err) {
            console.error(`Error checking ${field}:`, err);
            setExistingUser(null);
        } finally {
            setCheckingUser(false);
        }
    }, [existingUser, checkField]);

    const clearExistingUser = useCallback(() => {
        setExistingUser(null);
        setCheckField('');
    }, []);

    return { existingUser, checkingUser, checkField, checkUserExists, clearExistingUser };
}