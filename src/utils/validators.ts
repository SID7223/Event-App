import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const signupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      'Please enter a valid Indonesian phone number'
    )
    .optional(),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  terms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

export const profileSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      'Please enter a valid Indonesian phone number'
    )
    .optional(),
});

export type LoginFormData = Yup.InferType<typeof loginSchema>;
export type SignupFormData = Yup.InferType<typeof signupSchema>;
export type ProfileFormData = Yup.InferType<typeof profileSchema>;
