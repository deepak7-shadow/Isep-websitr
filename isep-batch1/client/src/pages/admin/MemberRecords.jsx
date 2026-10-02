import { useEffect, useState } from "react";
import MemberTable from "../../components/MemberTable";
import MemberDetailModal from "../../components/MemberDetailModal";
import api from "../../api/axios";

const MemberRecords = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const handleViewMember = async (member) => {
  try {
    const userId = member._id || member.id;

    const [projectsResponse, certificatesResponse, achievementsResponse] =
      await Promise.all([
        api.get(`/projects/user/${userId}`),
        api.get(`/certificates/user/${userId}`),
        api.get(`/achievements/user/${userId}`),
      ]);

    setSelectedMember({
      ...member,
      projectsCount: projectsResponse.data?.count,
      certificatesCount: certificatesResponse.data?.count,
      achievementsCount: achievementsResponse.data?.count,
    });
  } catch (error) {
    console.error("Failed to load member details:", error);
    setSelectedMember(member);
  }
};

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/users");

        setMembers(
  (response.data?.data || []).map((member) => ({
    ...member,
    id: member._id || member.id,
    name: member.fullName || member.name || "",
    photo: member.profilePhoto || member.photo || "",
    status: member.approvalStatus || member.status || "",
    registered: member.registeredAt || member.createdAt || "",
  }))
);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load member records."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Member Records
          </h1>

          <p className="mt-2 text-gray-600">
            Manage and view ISEP member records.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
            Loading member records...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-white p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <MemberTable
            members={members}
            onViewMember={handleViewMember}
          />
        )}
      </div>

      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};

export default MemberRecords;