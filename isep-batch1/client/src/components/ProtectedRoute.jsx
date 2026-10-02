import React from 'react';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../pages/AccessDenied';

/**
 * ProtectedRoute component that enforces authentication and role-based access control.
 * @param {Array<string>} allowedRoles - Roles permitted to view this route (e.g. ['member', 'head', 'admin'])
 * @param {React.ReactNode} children - The protected page/component
 * @param {Function} onRedirectToLogin - Callback to switch view to login
 */
export default function ProtectedRoute({
  allowedRoles = [],
  children,
  onRedirectToLogin
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('isep_admin_token') : null;

  // Session restoring loader
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-[#a3a1a8]">
        <div className="w-10 h-10 border-2 border-[#f3be65]/30 border-t-[#f3be65] rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-wider">Verifying session credentials…</span>
      </div>
    );
  }

  // Not authenticated
  const isUserAuthenticated = isAuthenticated || Boolean(user) || Boolean(adminToken);
  if (!isUserAuthenticated) {
    if (onRedirectToLogin) {
      onRedirectToLogin();
      return null;
    }

    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-6 py-16 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
          🔒
        </div>
        <div className="space-y-2 max-w-md">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
            Authentication Required
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#e4e1e5]">
            Members Portal Access
          </h2>
          <p className="text-xs sm:text-sm text-[#a3a1a8] leading-relaxed">
            Please sign in with your approved ISEP credentials to access this private module.
          </p>
        </div>
        {onRedirectToLogin && (
          <button
            onClick={onRedirectToLogin}
            className="px-6 py-2.5 rounded-xl bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] font-semibold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Sign In Now
          </button>
        )}
      </div>
    );
  }

  // Check role authorization
  const currentRole = user?.role || (adminToken ? 'admin' : 'member');
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return (
      <AccessDenied
        requiredRoles={allowedRoles}
        userRole={currentRole}
        onGoHome={() => window.location.href = '/'}
      />
    );
  }

  return children;
}
