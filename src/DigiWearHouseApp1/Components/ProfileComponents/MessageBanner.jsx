import React from 'react';

const MessageBanner = ({ successMessage, error }) => {
  return (
    <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-4">
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
    </div>
  );
};

export default MessageBanner;