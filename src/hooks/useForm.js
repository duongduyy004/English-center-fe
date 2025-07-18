import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validation';

export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValue(name, fieldValue);
  }, [setValue]);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setFieldTouched(name, true);

    // Validate field on blur
    if (validationSchema[name]) {
      const fieldValue = values[name];
      const rules = validationSchema[name];
      
      for (let rule of rules) {
        const error = rule(fieldValue);
        if (error) {
          setErrors(prev => ({
            ...prev,
            [name]: error
          }));
          break;
        }
      }
    }
  }, [values, validationSchema, setFieldTouched]);

  const validate = useCallback(() => {
    const { errors: validationErrors, isValid } = validateForm(values, validationSchema);
    setErrors(validationErrors);
    return isValid;
  }, [values, validationSchema]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submitForm = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    const isValid = validate();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [values, validate]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    validate,
    reset,
    submitForm,
    setIsSubmitting
  };
};
