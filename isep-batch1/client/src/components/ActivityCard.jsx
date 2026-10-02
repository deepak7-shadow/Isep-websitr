import React from 'react';

export default function ActivityCard({ activity, onEdit, onDelete }) {
  const image = activity.images && activity.images.length > 0
    ? activity.images[0]
    : null;

  return (
    <div className="group rounded-xl overflow-hidden bg-[#1b1b1e] border border-[#f3be65]/20 hover:border-[#f3be65]/60 transition-all duration-300 shadow-lg">

      {/* Activity Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">

        {image ? (
          <img
            src={image}
            alt={activity.title}
            loading="lazy"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#a3a1a8] text-sm">
            No image available
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#131316] via-transparent to-transparent opacity-80"></div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-[#131316]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] uppercase font-semibold tracking-wider text-[#f3be65] border border-[#f3be65]/30">
          {activity.category || 'Activity'}
        </div>
      </div>

      {/* Activity Details */}
      <div className="p-4">

        <h3 className="font-serif text-base font-semibold text-[#e4e1e5] group-hover:text-[#f3be65] transition-colors">
          {activity.title}
        </h3>

        <p className="text-xs text-[#a3a1a8] mt-1 line-clamp-3 leading-relaxed">
          {activity.description}
        </p>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#a3a1a8]">
          <span>
            {new Date(activity.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>

          {/* Admin Actions */}
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(activity)}
                className="text-[#f3be65] hover:underline"
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(activity._id)}
                className="text-red-400 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}