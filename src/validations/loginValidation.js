import { validationRules } from '../utils/validation';

export const loginValidationSchema = {
  email: [
    validationRules.required(),
    validationRules.email()
  ],
  password: [
    validationRules.required(),
    validationRules.minLength(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
    validationRules.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Mật khẩu phải bao gồm cả chữ cái và số')
  ]
};
