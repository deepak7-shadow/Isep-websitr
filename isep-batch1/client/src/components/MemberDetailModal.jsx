const MemberDetailModal = ({ member, onClose }) => {
  if (!member) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            Member Profile
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Profile */}
        <div className="p-6">

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">

            {/* Photo */}
            {member.photo ? (
              <img
                src={member.photo}
                alt={`${member.name} profile`}
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gray-100 text-3xl font-semibold text-gray-500">
                {member.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}

            {/* Basic Details */}
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900">
                {member.name || "—"}
              </h3>

              <p className="mt-1 capitalize text-gray-500">
                {member.role || "Member"}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {member.email || "—"}
              </p>

              <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                {member.status || "—"}
              </span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Registered</p>
              <p className="mt-1 font-medium text-gray-900">
                {member.registered || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Projects</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {member.projectsCount ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Certificates</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {member.certificatesCount ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Achievements</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {member.achievementsCount ?? 0}
              </p>
            </div>

          </div>

          {/* Description */}
          {member.bio && (
            <div className="mt-6 rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900">
                About
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {member.bio}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default MemberDetailModal;