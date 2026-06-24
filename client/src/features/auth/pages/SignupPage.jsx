import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { signupAction, googleLoginAction } from '../authActions';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email address';
    if (!formData.password) errors.password = 'Password is required';
    // ✅ Only require minimum length
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(signupAction(formData.name, formData.email, formData.password));
    } catch (err) {}
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(
        googleLoginAction({
          credential: credentialResponse.credential
        })
      );
    } catch (err) {}
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-beige-light via-beige/30 to-beige-dark/20 dark:from-darkgrey-dark dark:via-darkgrey/90 dark:to-darkgrey-dark px-4 py-12">
      <div className="w-full max-w-md bg-white/50 backdrop-blur-md dark:bg-darkgrey/40 border border-beige-dark/30 dark:border-darkgrey-light/30 rounded-3xl p-8 shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-extrabold tracking-wider text-darkgrey dark:text-beige-light">
            CODE<span className="text-beige dark:text-beige-dark">SHIFT</span>
          </Link>
          <p className="text-sm font-semibold text-darkgrey/60 dark:text-beige-dark mt-2">
            Create an account to start saving workspaces.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <Input
            label="Your Name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={validationErrors.name}
            required
          />

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
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            required
          />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign Up
          </Button>

          <div className="flex items-center gap-3 my-1">
            <hr className="flex-1 border-beige-dark/30 dark:border-darkgrey-light" />
            <span className="text-xs font-semibold text-darkgrey/40 dark:text-beige-dark/50">OR</span>
            <hr className="flex-1 border-beige-dark/30 dark:border-darkgrey-light" />
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              text="signup_with"
              size="large"
              width="350px"
            />
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-darkgrey/60 dark:text-beige-dark">
              Already have an account?{' '}
              <Link to="/login" className="text-darkgrey dark:text-beige font-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
export { SignupPage };