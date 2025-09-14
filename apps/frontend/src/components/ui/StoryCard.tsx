import React, { useState } from 'react';
import { Story, UserRole } from 'shared';

interface StoryCardProps {
  story: Story;
  isActive: boolean;
  userRole: UserRole;
  onEdit?: (storyId: string, title: string, description: string) => void;
  onDelete?: (storyId: string) => void;
  onSetActive?: (storyId: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isActive,
  userRole,
  onEdit,
  onDelete,
  onSetActive,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title);
  const [editDescription, setEditDescription] = useState(story.description);
  
  const isModerator = userRole === UserRole.MODERATOR;
  
  const handleSaveEdit = () => {
    if (onEdit && editTitle.trim()) {
      onEdit(story.id, editTitle.trim(), editDescription.trim());
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditTitle(story.title);
    setEditDescription(story.description);
    setIsEditing(false);
  };
  
  const handleSetActive = () => {
    if (onSetActive && !isActive) {
      onSetActive(story.id);
    }
  };
  
  return (
    <div className={`card p-4 ${isActive ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Story title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={3}
            placeholder="Story description"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              className="btn-primary text-sm py-1 px-3"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="btn-secondary text-sm py-1 px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-800">{story.title}</h3>
            {isActive && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                Active
              </span>
            )}
          </div>
          
          {story.description && (
            <p className="text-sm text-gray-600 mb-3">{story.description}</p>
          )}
          
          {story.finalEstimation !== null && (
            <div className="mb-3">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Estimated: {story.finalEstimation}
              </span>
            </div>
          )}
          
          {isModerator && (
            <div className="flex space-x-2">
              {!isActive && (
                <button
                  onClick={handleSetActive}
                  className="text-xs btn-primary py-1 px-2"
                >
                  Set Active
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs btn-secondary py-1 px-2"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(story.id)}
                className="text-xs btn-danger py-1 px-2"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
