import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AnimatedInput.css';

const AnimatedInput = ({
    label,
    type = 'text',
    value,
    onChange,
    error,
    success,
    helperText,
    placeholder = '',
    required = false,
    disabled = false,
    icon,
    showPasswordToggle = false,
    className = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef(null);

    const hasValue = value && value.length > 0;
    const isLabelFloating = isFocused || hasValue;

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    const handleContainerClick = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    const labelVariants = {
        default: {
            y: 0,
            scale: 1,
            color: '#47607E',
            transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
        },
        floating: {
            y: -24,
            scale: 0.85,
            color: error ? '#DC2626' : success ? '#16A34A' : '#0C3362',
            transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const errorVariants = {
        hidden: { opacity: 0, y: -8, height: 0 },
        visible: {
            opacity: 1,
            y: 0,
            height: 'auto',
            transition: { duration: 0.2 }
        },
        exit: {
            opacity: 0,
            y: -8,
            height: 0,
            transition: { duration: 0.15 }
        }
    };

    const shakeVariants = {
        shake: {
            x: [0, -10, 10, -8, 8, -5, 5, 0],
            transition: { duration: 0.5 }
        }
    };

    const getInputState = () => {
        if (error) return 'error';
        if (success) return 'success';
        if (isFocused) return 'focused';
        return 'default';
    };

    return (
        <motion.div
            className={`input-animated-wrapper ${className}`}
            animate={error ? 'shake' : undefined}
            variants={shakeVariants}
        >
            <motion.div
                className={`input-animated-container input-${getInputState()}`}
                onClick={handleContainerClick}
                whileHover={{ borderColor: error ? '#DC2626' : '#0C3362' }}
            >
                {icon && (
                    <motion.span
                        className="input-icon"
                        animate={{ color: isFocused ? '#D4AF37' : '#47607E' }}
                    >
                        {icon}
                    </motion.span>
                )}

                <div className="input-field-wrapper">
                    <motion.label
                        className="input-label-floating"
                        variants={labelVariants}
                        animate={isLabelFloating ? 'floating' : 'default'}
                    >
                        {label}
                        {required && <span className="input-required">*</span>}
                    </motion.label>

                    <input
                        ref={inputRef}
                        type={inputType}
                        value={value}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={isLabelFloating ? placeholder : ''}
                        disabled={disabled}
                        className="input-field"
                        {...props}
                    />
                </div>

                {showPasswordToggle && type === 'password' && (
                    <motion.button
                        type="button"
                        className="input-toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {showPassword ? '👁️' : '👁️🗨️'}
                    </motion.button>
                )}

                {success && !error && (
                    <motion.span
                        className="input-success-icon"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                        ✓
                    </motion.span>
                )}

                <motion.div
                    className="input-focus-glow"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused ? 1 : 0 }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>

            <AnimatePresence>
                {(error || helperText) && (
                    <motion.p
                        className={`input-helper ${error ? 'input-error-text' : ''}`}
                        variants={errorVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {error || helperText}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AnimatedInput;
