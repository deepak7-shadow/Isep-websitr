import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import TCSMeetingCard from '../components/TCSMeetingCard';
import TCSMeetingForm from '../components/TCSMeetingForm';

const TCSMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const { user } = useContext(AuthContext);
  const isAdmin = user && (user.role === 'admin' || user.isAdmin);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tcs-meetings');
      setMeetings(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load TCS meetings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this TCS meeting record?')) return;
    try {
      await axios.delete(`/api/tcs-meetings/${id}`);
      setMeetings(meetings.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete meeting.');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMeeting(null);
    fetchMeetings();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TCS Meeting Details</h1>
          <p className="text-gray-600 mt-1">Interactions, guidance, and archives from TCS representatives.</p>
        </div>
        {isAdmin && !showForm && (
          <button
            onClick={() => {
              setEditingMeeting(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
          >
            + Add TCS Meeting
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {showForm && isAdmin && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingMeeting ? 'Edit TCS Meeting' : 'Add New TCS Meeting'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingMeeting(null);
              }}
              className="text-gray-500 hover:text-gray-700 font-bold text-lg"
            >
              &times;
            </button>
          </div>
          <TCSMeetingForm meeting={editingMeeting} onSuccess={handleFormClose} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading TCS meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-lg text-gray-600">TCS meeting details will be added soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <TCSMeetingCard
              key={meeting._id}
              meeting={meeting}
              isAdmin={isAdmin}
              onEdit={() => handleEdit(meeting)}
              onDelete={() => handleDelete(meeting._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TCSMeetings;