import React from 'react';

const TCSMeetingCard = ({ meeting, isAdmin, onEdit, onDelete }) => {
  const formattedDate = meeting.date
    ? new Date(meeting.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="bg-[#1b1b1e] rounded-xl shadow-md border border-[#f3be65]/20 p-6 flex flex-col justify-between transition hover:border-[#f3be65]/40">
      <div>
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-xl font-bold text-[#e4e1e5] flex items-center gap-2">
            <span>🏢</span> {meeting.meetingTitle || 'Meeting with TCS Representative'}
          </h3>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="text-xs bg-white/5 hover:bg-white/10 text-[#e4e1e5] px-3 py-1 rounded transition border border-white/10"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded transition border border-red-500/20"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 text-[#a3a1a8] text-sm mb-4">
          <p className="flex items-center gap-2">
            <span className="font-semibold text-[#e4e1e5]">📅 Date:</span> {formattedDate}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold text-[#e4e1e5]">👤 Guest:</span> {meeting.guestName || 'N/A'}
          </p>
          <div>
            <span className="font-semibold text-[#e4e1e5] block mb-1">📝 Description:</span>
            <p className="text-[#a3a1a8] bg-[#131316] p-3 rounded-lg whitespace-pre-wrap border border-white/5">
              {meeting.description || 'No description provided.'}
            </p>
          </div>
          <div>
            <span className="font-semibold text-[#e4e1e5] block mb-1">📋 Notes:</span>
            <p className="text-[#a3a1a8] bg-[#131316] p-3 rounded-lg whitespace-pre-wrap border border-white/5">
              {meeting.notes || 'No notes provided.'}
            </p>
          </div>
        </div>
      </div>

      {meeting.images && meeting.images.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="font-semibold text-[#e4e1e5] block mb-2 text-sm">📸 Images:</span>
          <div className="grid grid-cols-3 gap-2">
            {meeting.images.map((img, index) => (
              <a
                key={index}
                href={img.startsWith('http') ? img : `/${img}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative aspect-video bg-[#131316] rounded-lg overflow-hidden border border-white/10"
              >
                <img
                  src={img.startsWith('http') ? img : `/${img}`}
                  alt={`TCS Meeting Image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TCSMeetingCard;