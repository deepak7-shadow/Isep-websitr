import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    branch: '',
    year: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword, branch, year } =
      formData;

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !branch || !year) {
      return 'Please fill in all required fields.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    if (password.length < 6) {
      return 'Password must contain at least 6 characters.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        branch: formData.branch,
        year: formData.year,
      });

      setSuccess('Registration submitted! Awaiting admin approval.');

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        branch: '',
        year: '',
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Registration failed. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0d] text-[#e4e1e5]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#f3be65]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-[#8b6f3d]/10 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(243,190,101,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(243,190,101,0.7) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-12">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] shadow-2xl backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* Brand panel */}
          <section className="relative hidden min-h-[700px] overflow-hidden border-r border-white/10 bg-[#111114] p-12 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-full border border-[#f3be65]/50 bg-[#f3be65]/5 shadow-[0_0_40px_rgba(243,190,101,0.08)]">
                <span className="font-serif text-xl font-bold tracking-wider text-[#f3be65]">
                  ISEP
                </span>
              </div>

              <p className="mb-3 text-xs font-mono uppercase tracking-[0.35em] text-[#f3be65]">
                ISEP • Batch 1
              </p>

              <h1 className="max-w-md font-serif text-5xl font-bold leading-[1.05] text-white">
                Begin your
                <span className="block text-[#f3be65]">
                  ISEP journey.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-sm leading-7 text-[#a3a1a8]">
                Create your member account and become part of the ISEP
                community. Every registration is reviewed by ISEP mentors
                before access is granted.
              </p>
            </div>

            <div>
              <div className="mb-6 h-px w-24 bg-gradient-to-r from-[#f3be65] to-transparent" />

              <div className="space-y-4 text-sm text-[#a3a1a8]">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#f3be65]/30 text-xs text-[#f3be65]">
                    01
                  </span>
                  <span>Submit your registration</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#f3be65]/30 text-xs text-[#f3be65]">
                    02
                  </span>
                  <span>ISEP mentors review your account</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#f3be65]/30 text-xs text-[#f3be65]">
                    03
                  </span>
                  <span>Access the member portal after approval</span>
                </div>
              </div>
            </div>
          </section>

          {/* Form panel */}
          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
            <div className="w-full max-w-xl">
              <div className="mb-8">
                <p className="mb-2 text-xs font-mono uppercase tracking-[0.3em] text-[#f3be65]">
                  Member Registration
                </p>

                <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                  Create your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#8f8d94]">
                  Complete your details below to submit your membership
                  registration.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-4">
                  <p className="text-sm font-medium text-emerald-300">
                    {success}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-300/60">
                    You can use the login page after your account has been
                    approved by the ISEP mentors.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Full name */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#f3be65]/60 focus:bg-[#f3be65]/[0.035] focus:ring-2 focus:ring-[#f3be65]/10"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#f3be65]/60 focus:bg-[#f3be65]/[0.035] focus:ring-2 focus:ring-[#f3be65]/10"
                  />
                </div>

                {/* Branch + Year */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">
                      Branch
                    </label>

                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-[#151518] px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-[#f3be65]/60 focus:ring-2 focus:ring-[#f3be65]/10"
                    >
                      <option value="">Select branch</option>
                      <option value="CSE">Computer Science & Engineering</option>
                      <option value="CSE (Data Science)">CSE (Data Science)</option>
                      <option value="ISE">Information Science & Engineering</option>
                      <option value="ECE">Electronics & Communication Engineering</option>
                      <option value="EEE">Electrical & Electronics Engineering</option>
                      <option value="ME">Mechanical Engineering</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">
                      Year
                    </label>

                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-[#151518] px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-[#f3be65]/60 focus:ring-2 focus:ring-[#f3be65]/10"
                    >
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 pr-20 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#f3be65]/60 focus:bg-[#f3be65]/[0.035] focus:ring-2 focus:ring-[#f3be65]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#f3be65]/70 transition hover:text-[#f3be65]"
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#a3a1a8]">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 pr-20 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[#f3be65]/60 focus:bg-[#f3be65]/[0.035] focus:ring-2 focus:ring-[#f3be65]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#f3be65]/70 transition hover:text-[#f3be65]"
                    >
                      {showConfirmPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#f3be65] px-5 py-4 text-sm font-bold tracking-wide text-[#111114] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffd98f] hover:shadow-[0_12px_35px_rgba(243,190,101,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {loading ? 'Submitting Registration...' : 'Submit Registration'}
                  </span>
                </button>
              </form>

              <div className="mt-7 text-center text-sm text-[#77757c]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#f3be65] transition hover:text-[#ffd98f]"
                >
                  Sign in
                </Link>
              </div>

              <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">
                ISEP • Member Portal • Batch 1
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}