import { useEffect, useState } from "react";
import api from "../api/axios";
import ApprovalCard from "../components/ApprovalCard";

export default function PendingApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/pending-users");

      const data = response.data;
      setUsers(data.users || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pending registration requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this registration?"
    );

    if (!confirmed) return;

    try {
      await api.put(`/admin/approve/${id}`);
      await fetchPendingUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to approve the user.");
    }
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this registration?"
    );

    if (!confirmed) return;

    try {
      await api.put(`/admin/reject/${id}`);
      await fetchPendingUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to reject the user.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Pending Approvals
        </h1>
        <p className="text-gray-500">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Pending Approvals
        </h1>
        <p className="text-red-600">{error}</p>

        <button
          onClick={fetchPendingUsers}
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Pending Approvals
        </h1>

        <p className="text-gray-500 mt-1">
          Review and manage pending registration requests.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">🎉</div>

          <h2 className="text-xl font-semibold text-gray-800">
            No pending requests 🎉
          </h2>

          <p className="text-gray-500 mt-2">
            All registration requests have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <ApprovalCard
              key={user._id || user.id}
              user={user}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}