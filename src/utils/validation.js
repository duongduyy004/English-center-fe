export const validationRules = {
  required: (message = 'Trường này là bắt buộc') => (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },

  email: (message = 'Email không hợp lệ') => (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  phone: (message = 'Số điện thoại không hợp lệ') => (value) => {
    if (!value) return null;
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return message;
    }
    return null;
  },

  minLength: (minLength, message) => (value) => {
    if (!value) return null;
    if (value.length < minLength) {
      return message || `Tối thiểu ${minLength} ký tự`;
    }
    return null;
  },

  maxLength: (maxLength, message) => (value) => {
    if (!value) return null;
    if (value.length > maxLength) {
      return message || `Tối đa ${maxLength} ký tự`;
    }
    return null;
  },

  min: (minValue, message) => (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) < minValue) {
      return message || `Giá trị tối thiểu là ${minValue}`;
    }
    return null;
  },

  max: (maxValue, message) => (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) > maxValue) {
      return message || `Giá trị tối đa là ${maxValue}`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message || 'Định dạng không hợp lệ';
    }
    return null;
  },

  date: (message = 'Ngày không hợp lệ') => (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return message;
    }
    return null;
  },

  time: (message = 'Thời gian không hợp lệ') => (value) => {
    if (!value) return null;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return message;
    }
    return null;
  },

  number: (message = 'Phải là số') => (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  positiveNumber: (message = 'Phải là số dương') => (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (isNaN(Number(value)) || Number(value) <= 0) {
      return message;
    }
    return null;
  },

  compare: (compareValue, operator = '===', message) => (value) => {
    if (!value) return null;
    
    let isValid = false;
    switch (operator) {
      case '===':
        isValid = value === compareValue;
        break;
      case '!==':
        isValid = value !== compareValue;
        break;
      case '>':
        isValid = Number(value) > Number(compareValue);
        break;
      case '>=':
        isValid = Number(value) >= Number(compareValue);
        break;
      case '<':
        isValid = Number(value) < Number(compareValue);
        break;
      case '<=':
        isValid = Number(value) <= Number(compareValue);
        break;
      default:
        isValid = false;
    }
    
    if (!isValid) {
      return message || `Giá trị phải ${operator} ${compareValue}`;
    }
    return null;
  },

  oneOf: (allowedValues, message) => (value) => {
    if (!value) return null;
    if (!allowedValues.includes(value)) {
      return message || `Giá trị phải là một trong: ${allowedValues.join(', ')}`;
    }
    return null;
  }
};

export const createValidator = (rules) => {
  return (values) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = values[field];
      
      for (let rule of fieldRules) {
        const error = rule(value);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    });
    
    return errors;
  };
};

export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach(field => {
    const rules = validationSchema[field];
    const value = formData[field];

    for (let rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        isValid = false;
        break;
      }
    }
  });

  return { errors, isValid };
};

// Common validation schemas
export const authValidationSchema = {
  username: [
    validationRules.required(),
    validationRules.minLength(3, 'Tên đăng nhập tối thiểu 3 ký tự')
  ],
  password: [
    validationRules.required(),
    validationRules.minLength(6, 'Mật khẩu tối thiểu 6 ký tự')
  ]
};

export const teacherValidationSchema = {
  name: [
    validationRules.required(),
    validationRules.minLength(2, 'Tên tối thiểu 2 ký tự')
  ],
  email: [
    validationRules.required(),
    validationRules.email()
  ],
  phone: [
    validationRules.required(),
    validationRules.phone()
  ],
  birthDate: [
    validationRules.required(),
    validationRules.date()
  ]
};

export const studentValidationSchema = {
  name: [
    validationRules.required(),
    validationRules.minLength(2, 'Tên tối thiểu 2 ký tự')
  ],
  birthDate: [
    validationRules.required(),
    validationRules.date()
  ],
  grade: [
    validationRules.required(),
    validationRules.number()
  ]
};

export const classValidationSchema = {
  name: [
    validationRules.required(),
    validationRules.minLength(2, 'Tên lớp tối thiểu 2 ký tự')
  ],
  grade: [
    validationRules.required(),
    validationRules.number()
  ],
  year: [
    validationRules.required(),
    validationRules.number(),
    validationRules.min(2020, 'Năm phải từ 2020 trở lên')
  ],
  maxStudents: [
    validationRules.required(),
    validationRules.positiveNumber(),
    validationRules.min(1, 'Số học sinh tối thiểu là 1')
  ]
};
