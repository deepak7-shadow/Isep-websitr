import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password);

      /*
       * M2 backend contract:
       * pending  -> account awaiting approval
       * rejected -> registration not approved
       * approved -> member dashboard
       * admin    -> admin dashboard
       */

      if (data?.user?.approvalStatus === 'pending') {
        setSuccess('Your account is awaiting approval.');
        return;
      }

      if (data?.user?.approvalStatus === 'rejected') {
        setError('Your registration was not approved.');
        return;
      }

      if (data?.user?.role === 'admin' || data?.admin?.role === 'admin') {
        window.location.href = '/admin';
        return;
      }

      if (data?.user?.approvalStatus === 'approved') {
        window.location.href = '/dashboard';
        return;
      }

      /*
       * Some backend implementations may return a direct
       * success message without exposing the user object.
       */
      if (data?.success) {
        setSuccess(data.message || 'Login successful.');
      } else {
        setError(data?.message || 'Unable to sign in. Please try again.');
      }
    } catch (err) {
      const responseData = err?.response?.data;

      const message =
        responseData?.message ||
        'Unable to sign in. Please check your credentials and try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131316] text-[#e4e1e5] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-180px] left-[-150px] w-[420px] h-[420px] bg-[#f3be65]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-180px] right-[-120px] w-[420px] h-[420px] bg-[#f3be65]/8 rounded-full blur-[120px]" />
        <div className="absolute top-[35%] right-[20%] w-[180px] h-[180px] bg-[#ffffff]/[0.025] rounded-full blur-[90px]" />
      </div>

      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(243,190,101,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(243,190,101,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">

          {/* LEFT BRAND PANEL */}
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#f3be65]/20 bg-[#f3be65]/5 mb-8">
                <span className="w-2 h-2 rounded-full bg-[#f3be65] shadow-[0_0_12px_rgba(243,190,101,0.8)]" />
                <span className="text-xs uppercase tracking-[0.25em] text-[#f3be65] font-semibold">
                  ISEP Member Portal
                </span>
              </div>

              <h1 className="text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight">
                Welcome
                <span className="block text-[#f3be65] mt-2">
                  back.
                </span>
              </h1>

              <p className="mt-7 text-lg text-[#a9a6ad] leading-relaxed max-w-lg">
                Sign in to access your ISEP member workspace,
                activities, achievements, projects and professional
                opportunities.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md p-5">
                  <div className="text-2xl font-bold text-[#f3be65]">
                    01
                  </div>
                  <div className="text-xs text-[#9f9ca3] mt-2">
                    Secure Access
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md p-5">
                  <div className="text-2xl font-bold text-[#f3be65]">
                    02
                  </div>
                  <div className="text-xs text-[#9f9ca3] mt-2">
                    Member Profile
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-md p-5">
                  <div className="text-2xl font-bold text-[#f3be65]">
                    03
                  </div>
                  <div className="text-xs text-[#9f9ca3] mt-2">
                    ISEP Activities
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-[28px] border border-white/10 bg-[#1b1b20]/90 backdrop-blur-xl shadow-2xl overflow-hidden">

              {/* Card header */}
              <div className="px-8 pt-9 pb-7 border-b border-white/[0.07]">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-11 h-11 rounded-xl bg-[#f3be65] flex items-center justify-center shadow-[0_0_25px_rgba(243,190,101,0.2)]">
                    <span className="text-[#171719] font-black text-lg">
                      I
                    </span>
                  </div>

                  <div>
                    <div className="font-bold tracking-wide">
                      ISEP
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#77747b]">
                      Member Portal
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Sign in
                </h2>

                <p className="text-sm text-[#918e95] mt-2">
                  Enter your credentials to continue.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8">

                {/* Error */}
                {error && (
                  <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="text-red-400 text-lg">!</span>
                      <p className="text-sm text-red-300 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="mb-5 rounded-xl border border-[#f3be65]/20 bg-[#f3be65]/10 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="text-[#f3be65] text-lg">✓</span>
                      <p className="text-sm text-[#f3d89d] leading-relaxed">
                        {success}
                      </p>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#d5d2d7] mb-2"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77747b]">
                      @
                    </span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-11 py-3.5 text-sm text-white placeholder:text-[#626067] outline-none transition focus:border-[#f3be65]/50 focus:bg-white/[0.055] focus:ring-2 focus:ring-[#f3be65]/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-7">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#d5d2d7] mb-2"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77747b]">
                      •
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-11 pr-12 py-3.5 text-sm text-white placeholder:text-[#626067] outline-none transition focus:border-[#f3be65]/50 focus:bg-white/[0.055] focus:ring-2 focus:ring-[#f3be65]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg text-[#77747b] hover:text-[#f3be65] hover:bg-white/5 transition"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? '◉' : '○'}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#f3be65] text-[#171719] font-bold py-3.5 transition-all duration-200 hover:bg-[#ffd17f] hover:shadow-[0_0_30px_rgba(243,190,101,0.2)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-4 h-4 border-2 border-[#171719]/30 border-t-[#171719] rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>

                {/* Register */}
                <div className="text-center mt-7">
                  <span className="text-sm text-[#77747b]">
                    Don't have an account?
                  </span>{' '}
                  <Link
                    to="/register"
                    className="text-sm font-semibold text-[#f3be65] hover:text-[#ffd17f] transition"
                  >
                    Create an account
                  </Link>
                </div>

                {/* Security note */}
                <div className="mt-7 pt-6 border-t border-white/[0.07]">
                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#66636a]">
                    <span className="text-[#f3be65]">◆</span>
                    ISEP secure member authentication
                  </div>
                </div>
              </form>
            </div>

            <p className="text-center text-xs text-[#57545b] mt-6">
              Indian Society for Electronics & Power
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
