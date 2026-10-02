import { useMemo, useState } from "react";

const MemberTable = ({ members = [], onViewMember }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const filteredMembers = useMemo(() => {
    const result = members.filter((member) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        member.name?.toLowerCase().includes(searchText) ||
        member.email?.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "all" || member.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortBy === "date") {
        return (
          new Date(b.registered || 0) -
          new Date(a.registered || 0)
        );
      }

      return 0;
    });
  }, [members, search, roleFilter, statusFilter, sortBy]);

  return (
    <div className="w-full">

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">

        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-500"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="all">All Roles</option>
          <option value="member">Member</option>
          <option value="head">Head</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Registered Date</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">

          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Photo
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Name
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Email
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Role
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Registered
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">

                  {/* Photo */}
                  <td className="px-5 py-4">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={`${member.name} profile`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                        {member.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                    {member.name || "—"}
                  </td>

                  {/* Email */}
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {member.email || "—"}
                  </td>

                  {/* Role */}
                  <td className="whitespace-nowrap px-5 py-4 text-sm capitalize text-gray-600">
                    {member.role || "—"}
                  </td>

                  {/* Status */}
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                      {member.status || "—"}
                    </span>
                  </td>

                  {/* Registered */}
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {member.registered || "—"}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onViewMember?.(member)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-10 text-center text-sm text-gray-500"
                >
                  No members found.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* Result Count */}
      <p className="mt-3 text-sm text-gray-500">
        Showing {filteredMembers.length} member
        {filteredMembers.length !== 1 ? "s" : ""}
      </p>

    </div>
  );
};

export default MemberTable;