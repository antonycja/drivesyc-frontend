'use client';

import { useState } from 'react';
import { validateEmail, validatePhoneNumber } from '../utils/validation';

export function useLoginValidation() {
  const [emailOrPhoneError, setEmailOrPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmailOrPhone = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.includes('@')) {
      return validateEmail(trimmed);
    }
    return validatePhoneNumber(trimmed);
  };

  const handleEmailOrPhoneChange = (value: string) => {
    if (emailOrPhoneError && value) {
      setEmailOrPhoneError('');
    }
  };

  const handlePasswordChange = (value: string) => {
    if (passwordError && value) {
      setPasswordError('');
    }
  };

  const validateForm = (emailOrPhone: string, password: string) => {
    let isValid = true;
    
    if (!emailOrPhone) {
      setEmailOrPhoneError('Email or phone number is required');
      isValid = false;
    } else if (!validateEmailOrPhone(emailOrPhone)) {
      const trimmed = emailOrPhone.trim();
      if (trimmed.includes('@')) {
        setEmailOrPhoneError('Please enter a valid email address');
      } else {
        setEmailOrPhoneError('Please enter a valid phone number (10-15 digits)');
      }
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  return {
    emailOrPhoneError,
    passwordError,
    validateForm,
    handleEmailOrPhoneChange,
    handlePasswordChange,
  };
}
