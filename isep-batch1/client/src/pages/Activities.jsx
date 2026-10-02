import React, { useEffect, useState } from 'react';
import { activitiesApi } from '../api/axios';
import ActivityCard from '../components/ActivityCard';
import ActivityForm from '../components/ActivityForm';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isAdmin = Boolean(localStorage.getItem('isep_admin_token'));

  const loadActivities = async () => {
    try {
      setLoading(true);

      const response = await activitiesApi.getAll();

      setActivities(response.data.data || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setMessage('');

      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('date', data.date);
      formData.append('description', data.description);
      formData.append('category', data.category);

      formData.append(
        'existingImages',
        JSON.stringify(data.existingImages || [])
      );

      (data.newImages || []).forEach((file) => {
        formData.append('images', file);
      });

      if (editingActivity) {
        await activitiesApi.update(editingActivity._id, formData);
        setMessage('Activity updated successfully.');
      } else {
        await activitiesApi.create(formData);
        setMessage('Activity added successfully.');
      }

      setShowForm(false);
      setEditingActivity(null);

      await loadActivities();
    } catch (error) {
      console.error('Activity save failed:', error);

      setMessage(
        error.response?.data?.message || 'Failed to save activity.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity permanently?')) {
      return;
    }

    try {
      await activitiesApi.delete(id);

      setMessage('Activity deleted successfully.');

      await loadActivities();
    } catch (error) {
      console.error('Activity deletion failed:', error);

      setMessage(
        error.response?.data?.message || 'Failed to delete activity.'
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#f3be65]">
          ISEP Memories
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#e4e1e5]">
          Activities & Memories
        </h1>

        <p className="text-xs sm:text-sm text-[#a3a1a8] leading-relaxed">
          A collection of ISEP activities, workshops, events, college activities,
          and memorable team outings.
        </p>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              setEditingActivity(null);
              setShowForm(!showForm);
              setMessage('');
            }}
            className="px-5 py-2.5 rounded-lg bg-[#f3be65] hover:bg-[#d4a24c] text-[#131316] text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
          >
            {showForm ? 'Close Form' : '+ Add Activity'}
          </button>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className="max-w-2xl mx-auto p-3 rounded-lg bg-[#f3be65]/10 border border-[#f3be65]/30 text-[#f3be65] text-xs text-center">
          {message}
        </div>
      )}

      {/* Admin Form */}
      {isAdmin && showForm && (
        <div className="max-w-3xl mx-auto">
          <ActivityForm
            initialData={editingActivity}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Activities */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#a3a1a8]">
          Loading activities...
        </div>
      ) : activities.length === 0 ? (
        <div className="py-20 text-center">
          <div className="bg-[#1b1b1e] border border-[#f3be65]/20 rounded-2xl p-10 max-w-xl mx-auto">
            <h2 className="font-serif text-xl font-bold text-[#e4e1e5]">
              Activities will be added soon.
            </h2>

            <p className="text-xs text-[#a3a1a8] mt-2">
              Check back later for ISEP activities, workshops, events,
              and team memories.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              onEdit={isAdmin ? handleEdit : null}
              onDelete={isAdmin ? handleDelete : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}