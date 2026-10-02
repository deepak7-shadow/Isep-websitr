import { useEffect, useState } from "react";
import HeadCard from "../components/HeadCard";
import api from "../api/axios";
const ISEPStructure = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/profile");
        setMembers(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load ISEP members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

const mentors = [
  {
    name: "Ganesh Mani Bhaiya",
    role: "Main Mentor / Admin",
    description:
      "Main mentor and administrator supporting the overall ISEP structure and activities.",
  },
  {
    name: "Amrutha Didi",
    role: "Main Mentor / Admin",
    description:
      "Main mentor and administrator supporting ISEP members and activities.",
  },
];

const heads = [
  {
    name: "Head 1",
    role: "ISEP Head / Admin",
    description:
      "ISEP Head responsible for coordinating members and supporting ISEP activities.",
  },
  {
    name: "Head 2",
    role: "ISEP Head / Admin",
    description:
      "ISEP Head responsible for coordinating members and supporting ISEP activities.",
  },
];



const ISEPStructure = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/profile");
        setMembers(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load ISEP members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
            ISEP
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            ISEP Structure
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Meet the mentors, heads, and members who form the ISEP community.
          </p>
        </div>

        {/* Main Mentors / Admins */}
        <section className="mb-14">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Main Mentors / Admins
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              ISEP leadership and mentorship
            </p>
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2">
            {mentors.map((mentor) => (
              <HeadCard
                key={mentor.name}
                name={mentor.name}
                role={mentor.role}
                description={mentor.description}
              />
            ))}
          </div>
        </section>

        {/* ISEP Heads */}
        <section className="mb-14">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              ISEP Heads / Admins
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              ISEP heads and coordinators
            </p>
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2">
            {heads.map((head) => (
              <HeadCard
                key={head.name}
                name={head.name}
                role={head.role}
                description={head.description}
              />
            ))}
          </div>
        </section>

        {/* 18 ISEP Members */}
        <section>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              ISEP Members
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              18 ISEP members
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {members.map((member) => (
  <div
    key={member._id || member.id}
    className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
  >
    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-semibold text-gray-500">
      {member.fullName?.charAt(0)?.toUpperCase() || "M"}
    </div>

    <h3 className="font-semibold text-gray-900">
      {member.fullName || member.name}
    </h3>

    <p className="mt-1 text-sm text-gray-500">
      {member.role || "Member"}
    </p>
  </div>
))}