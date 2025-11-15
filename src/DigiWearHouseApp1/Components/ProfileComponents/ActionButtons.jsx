import React from 'react';

const ActionButtons = ({ activeSection, isEditing, handleEdit, handleSave, handleCancel, updateLoading }) => {
  if (activeSection === 'rating' || activeSection === 'support') return null;

  return (
    <div className="m-10 lg:mt-12 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
      {!isEditing ? (
        <button
          onClick={handleEdit}
          disabled={updateLoading}
          className={`w-full sm:w-auto px-8 lg:px-12 py-2 lg:py-2 bg-primary-blue text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-base lg:text-lg ${
            updateLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Edit
        </button>
      ) : (
        <>
          <button
            onClick={handleCancel}
            disabled={updateLoading}
            className={`w-full sm:w-auto px-8 lg:px-10 py-3 lg:py-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-base lg:text-lg ${
              updateLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateLoading}
            className={`w-full sm:w-auto px-8 lg:px-10 py-3 lg:py-4 bg-primary-blue text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-sm lg:text-base ${
              updateLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {updateLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;