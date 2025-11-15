import React from 'react';

const ProfileHeader = ({ profileData, isEditing, handleImageUpload, updateLoading }) => {
  return (
    <div className="relative h-48 md:h-64 lg:h-80 bg-gray-300 w-full">
      <img src={profileData.coverImage || '/default-cover.jpg'} alt="Cover" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-blue bg-opacity-30"></div>
      <div className="absolute -bottom-28 left-0 right-0 px-4 md:px-6 lg:px-8 xl:px-12 pb-6">
        <div className="flex items-start flex-col space-x-6">
          <div className=" flex relative">
            <img
              src={profileData.profileImage || '/default-profile.jpg'}
              alt="Profile"
              className="w-42 h-42 md:w-32 md:h-48 lg:w-56 lg:h-58 rounded-full object-cover shadow-lg"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-4 w-10 h-10 bg-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'profileImage')}
                  className="hidden"
                  disabled={updateLoading}
                />
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            )}
          </div>
          <div className="flex flex-col text-black pb-4 ml-8">
            <h1 className="text-xl md:text-xl lg:text-2xl font-semibold">{profileData.fullName || 'User Name'}</h1>
            <p className="text-xs md:text-sm lg:text-base ">{profileData.address || 'Location not set'}</p>
          </div>
        </div>
      </div>
      {isEditing ? (
        <label className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 bg-[#4F9EBB] bg-opacity-20 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-sm lg:text-base backdrop-blur-sm hover:bg-opacity-30 transition-colors cursor-pointer">
          Change Cover Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'coverImage')}
            className="hidden"
            disabled={updateLoading}
          />
        </label>
      ) : (
        // <button className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 bg-[#4F9EBB] bg-opacity-20 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-sm lg:text-base backdrop-blur-sm hover:bg-opacity-30 transition-colors">
          <></>
        // </button>
      )}
    </div>
  );
};

export default ProfileHeader;