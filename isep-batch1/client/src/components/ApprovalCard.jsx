export default function ApprovalCard({ user, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between gap-4">      {/* User details */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-800">
          {user.name}
        </h3>

        <p className="text-sm text-gray-600">
          {user.email}
        </p>

        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <span>Branch: {user.branch || "N/A"}</span>
          <span>Role: {user.role || "N/A"}</span>
        </div>

        {user.createdAt && (
          <p className="text-xs text-gray-400 mt-1">
            Registered: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
          🟡 Pending
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(user._id || user.id)}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
        >
          Approve
        </button>

        <button
          onClick={() => onReject(user._id || user.id)}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
        >
          Reject
        </button>
      </div>

    </div>
  );
}