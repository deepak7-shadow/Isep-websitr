import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PendingApproval() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#131316] text-[#e4e1e5] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-180px] left-[-120px] w-[420px] h-[420px] rounded-full bg-[#f3be65]/10 blur-[130px]" />
        <div className="absolute bottom-[-180px] right-[-120px] w-[420px] h-[420px] rounded-full bg-[#f3be65]/8 blur-[130px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(243,190,101,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(243,190,101,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Brand */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f3be65] flex items-center justify-center shadow-[0_0_30px_rgba(243,190,101,0.18)]">
                <span className="text-[#171719] font-black text-xl">
                  I
                </span>
              </div>

              <div>
                <div className="font-bold tracking-wide text-lg">
                  ISEP
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#77747b]">
                  Member Portal
                </div>
              </div>
            </div>
          </div>

          {/* Main card */}
          <div className="rounded-[28px] border border-white/10 bg-[#1b1b20]/90 backdrop-blur-xl shadow-2xl overflow-hidden">

            {/* Top accent */}
            <div className="h-1 bg-[#f3be65]" />

            <div className="px-8 py-10 text-center">

              {/* Pending icon */}
              <div className="relative mx-auto w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full bg-[#f3be65]/10 animate-pulse" />

                <div className="absolute inset-2 rounded-full border border-[#f3be65]/30 bg-[#f3be65]/5 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full border-2 border-[#f3be65] border-t-transparent animate-spin" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#f3be65] text-2xl font-bold">
                    !
                  </span>
                </div>
              </div>

              {/* Heading */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f3be65]/20 bg-[#f3be65]/5 px-4 py-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#f3be65] animate-pulse" />
                <span className="text-xs uppercase tracking-[0.18em] text-[#f3be65] font-semibold">
                  Approval Pending
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Your account is under review
              </h1>

              <p className="mt-4 text-[#9a979e] leading-relaxed">
                Your registration has been successfully submitted.
                An ISEP mentor will review your account before you
                can access the member portal.
              </p>

              {/* Status timeline */}
              <div className="mt-9 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left">

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#f3be65] text-[#171719] flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>

                    <div className="w-px h-8 bg-[#f3be65]/30 mt-1" />
                  </div>

                  <div className="pt-1">
                    <p className="text-sm font-semibold text-white">
                      Registration submitted
                    </p>
                    <p className="text-xs text-[#77747b] mt-1">
                      Your application has been received.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-[#f3be65] bg-[#f3be65]/10 text-[#f3be65] flex items-center justify-center text-sm font-bold">
                      2
                    </div>

                    <div className="w-px h-8 bg-white/10 mt-1" />
                  </div>

                  <div className="pt-1">
                    <p className="text-sm font-semibold text-white">
                      Mentor approval
                    </p>
                    <p className="text-xs text-[#77747b] mt-1">
                      Your registration is awaiting ISEP mentor review.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.025] text-[#66636a] flex items-center justify-center text-sm font-bold">
                    3
                  </div>

                  <div className="pt-1">
                    <p className="text-sm font-semibold text-[#77747b]">
                      Member access
                    </p>
                    <p className="text-xs text-[#55525a] mt-1">
                      Access will be available after approval.
                    </p>
                  </div>
                </div>

              </div>

              {/* Official message */}
              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/10 p-5 text-left">
                <div className="flex gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#f3be65]/10 flex items-center justify-center">
                    <span className="text-[#f3be65] text-sm">
                      i
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#d5d2d7]">
                      What happens next?
                    </p>

                    <p className="text-xs text-[#77747b] leading-relaxed mt-1.5">
                      Please wait for your account to be reviewed.
                      Once approved, you can sign in again to access
                      your ISEP member dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full mt-8 rounded-xl border border-white/10 bg-white/[0.035] py-3.5 text-sm font-semibold text-[#d5d2d7] transition-all hover:border-[#f3be65]/30 hover:bg-[#f3be65]/5 hover:text-[#f3be65]"
              >
                Log out
              </button>

              <p className="text-[11px] text-[#55525a] mt-5">
                ISEP secure member portal
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[#57545b] mt-6">
            Indian Society for Electronics & Power
          </p>
        </div>
      </div>
    </div>
  );
}