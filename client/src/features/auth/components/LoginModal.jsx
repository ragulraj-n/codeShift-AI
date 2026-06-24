import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { loginAction, googleLoginAction } from '../authActions';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationErrors({
      ...validationErrors,
      [e.target.name]: ''
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email address';
    if (!formData.password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(loginAction(formData.email, formData.password));
      onClose(); // Close on success
    } catch (err) {
      // Errors handled by slice/toast
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(
        googleLoginAction({
          credential: credentialResponse.credential
        })
      );
      onClose();
    } catch (err) {
      // Handled
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In failed. Please try again.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log In to CodeShift">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={validationErrors.email}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={validationErrors.password}
          required
        />

        <Button type="submit" loading={loading} className="w-full mt-2">
          Log In
        </Button>

        {/* Separator
        <div className="flex items-center gap-3 my-2">
          <hr className="flex-1 border-beige-dark/30 dark:border-darkgrey-light" />
          <span className="text-xs font-semibold text-darkgrey/40 dark:text-beige-dark/50">OR</span>
          <hr className="flex-1 border-beige-dark/30 dark:border-darkgrey-light" />
        </div> */}

        {/* Google Authentication Button */}
        {/* <div className="flex justify-center mt-2 w-full">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID?.startsWith('mock_') ? (
            <button
              type="button"
              onClick={() => handleGoogleSuccess({
                credential: 'mock_' + JSON.stringify({
                  sub: 'mock_google_id_12345',
                  email: 'mockgoogle@codeshift.dev',
                  name: 'Mock Developer',
                  picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MockDev'
                })
              })}
              className="w-full py-2.5 px-4 bg-darkgrey hover:bg-darkgrey-light text-beige hover:text-white border border-beige-dark/20 hover:border-beige/50 font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Sign In with Dev Google Mock</span>
            </button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              text="signin_with"
              size="large"
              width="320px"
            />
          )}
        </div> */}

        <div className="text-center mt-4">
          <p className="text-sm text-darkgrey/60 dark:text-beige-dark">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-darkgrey dark:text-beige font-bold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;
export { LoginModal };
