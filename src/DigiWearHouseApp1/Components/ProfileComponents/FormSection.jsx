import React from 'react';

const FormSection = ({ activeSection, profileData, isEditing, handleInputChange, handleArrayFieldChange, updateLoading }) => {
  const renderAccountForm = () => (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 2xl:gap-12">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Full Name</label>
          <input
            type="text"
            value={profileData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Your full name"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Mobile Number</label>
          <input
            type="tel"
            value={profileData.mobileNumber}
            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
            placeholder="Mobile number"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Email Id</label>
          <input
            type="email"
            value={profileData.email}
            placeholder="Email Id"
            disabled={true}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>
        {isEditing && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-left">New Password</label>
              <input
                type="password"
                value={profileData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-left">Confirm Password</label>
              <input
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
              />
            </div>
          </>
        )}
        <div className="space-y-2 lg:col-span-2 2xl:col-span-3">
          <label className="block text-sm font-medium text-gray-700 text-left">Address</label>
          <textarea
            value={profileData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Address"
            rows="3"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
      </div>
    </div>
  );

  const renderVendorForm = () => {
    const sellsForOptions = ['Men', 'Women', 'Kids', 'Unisex'];
    const categoryOptions = ['Clothing', 'Accessories'];
    const designTypeOptions = ['Type 1', 'Type 2', 'Traditional', 'Modern'];
    const materialTypeOptions = ['Cotton Lycra', 'Silk', 'Cotton', 'Polyester', 'Linen'];
    const dressTypeOptions = ['Western/Light', 'Traditional', 'Party Wear', 'Casual', 'Formal'];

    return (
      <div className="w-full">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-6">Who do you sell for?</h3>
          <div className="flex flex-wrap gap-3">
            {sellsForOptions.map((option) => {
              const isSelected = profileData.sellsFor.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => isEditing && handleArrayFieldChange('sellsFor', option, isSelected)}
                  disabled={!isEditing}
                  className={`px-6 py-3 rounded-full text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-blue text-white'
                      : isEditing
                      ? 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white'
                      : 'bg-gray-100 text-gray-700'
                  } ${!isEditing ? 'cursor-not-allowed' : ''}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 lg:gap-12 mt-8">
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 text-left">Select Categories</h4>
            <div className="space-y-3">
              {categoryOptions.map((category) => {
                const isSelected = profileData.selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => isEditing && handleArrayFieldChange('selectedCategories', category, isSelected)}
                    disabled={!isEditing}
                    className={`w-full px-6 py-4 rounded-lg transition-colors font-medium ${
                      isSelected
                        ? 'bg-primary-blue text-white'
                        : isEditing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 text-left">Design Type</h4>
            <div className="grid grid-cols-2 gap-3">
              {designTypeOptions.map((design) => {
                const isSelected = profileData.designTypes.includes(design);
                return (
                  <button
                    key={design}
                    type="button"
                    onClick={() => isEditing && handleArrayFieldChange('designTypes', design, isSelected)}
                    disabled={!isEditing}
                    className={`px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                      isSelected
                        ? 'bg-primary-blue text-white'
                        : isEditing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {design}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 text-left">Material Type</h4>
            <div className="flex flex-wrap gap-2">
              {materialTypeOptions.map((material) => {
                const isSelected = profileData.materialTypes.includes(material);
                return (
                  <button
                    key={material}
                    type="button"
                    onClick={() => isEditing && handleArrayFieldChange('materialTypes', material, isSelected)}
                    disabled={!isEditing}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary-blue text-white'
                        : isEditing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {material}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 text-left">Dress Type</h4>
            <div className="flex flex-wrap gap-2">
              {dressTypeOptions.map((dress) => {
                const isSelected = profileData.dressTypes.includes(dress);
                return (
                  <button
                    key={dress}
                    type="button"
                    onClick={() => isEditing && handleArrayFieldChange('dressTypes', dress, isSelected)}
                    disabled={!isEditing}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary-blues text-white'
                        : isEditing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {dress}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShopForm = () => (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 2xl:gap-12">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Shop Name</label>
          <input
            type="text"
            value={profileData.shopName}
            onChange={(e) => handleInputChange('shopName', e.target.value)}
            placeholder="Your shop name"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">GSTN Number</label>
          <input
            type="text"
            value={profileData.gstnNumber}
            onChange={(e) => handleInputChange('gstnNumber', e.target.value)}
            placeholder="GST number"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">First Name</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="First name"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Business Type</label>
          <input
            type="text"
            value={profileData.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
            placeholder="Business type"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2 lg:col-span-2 2xl:col-span-3">
          <label className="block text-sm font-medium text-gray-700 text-left">Shop Address</label>
          <textarea
            value={profileData.shopAddress}
            onChange={(e) => handleInputChange('shopAddress', e.target.value)}
            placeholder="Shop address"
            rows="3"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
      </div>
    </div>
  );

  const renderPayoutForm = () => (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Bank Name</label>
          <input
            type="text"
            value={profileData.bankName}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            placeholder="Bank name"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Bank Address</label>
          <input
            type="text"
            value={profileData.bankAddress}
            onChange={(e) => handleInputChange('bankAddress', e.target.value)}
            placeholder="Branch name/address"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Account Holder Name</label>
          <input
            type="text"
            value={profileData.accountHolderName}
            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
            placeholder="Account holder name"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">Bank Account Number</label>
          <input
            type="text"
            value={profileData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            placeholder="Bank account number"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">IFSC Code</label>
          <input
            type="text"
            value={profileData.ifscCode}
            onChange={(e) => handleInputChange('ifscCode', e.target.value)}
            placeholder="IFSC code"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 text-left">UPI ID</label>
          <input
            type="text"
            value={profileData.upiId}
            onChange={(e) => handleInputChange('upiId', e.target.value)}
            placeholder="UPI ID"
            disabled={!isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
          />
        </div>
      </div>
    </div>
  );

  const renderRatingForm = () => (
    <div className="w-full space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Rating Summary */}
        <div className="text-center lg:text-left">
          <div className="text-6xl font-bold text-gray-900 mb-4">4.5</div>
          <div className="flex items-center justify-center lg:justify-start mb-4">
            {[...Array(4)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            ))}
            <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              <path d="M10 15V0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15z" fill="gray"/>
            </svg>
            {[...Array(0)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-gray-300 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            ))}
          </div>
          <div className="text-base text-gray-600">120 reviews</div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm w-3">5</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-gray-800" style={{ width: '40%' }} />
              </div>
              <span className="text-sm text-gray-600 w-10">40%</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm w-3">4</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-gray-600" style={{ width: '30%' }} />
              </div>
              <span className="text-sm text-gray-600 w-10">30%</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm w-3">3</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-gray-400" style={{ width: '15%' }} />
              </div>
              <span className="text-sm text-gray-600 w-10">15%</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm w-3">2</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-gray-300" style={{ width: '10%' }} />
              </div>
              <span className="text-sm text-gray-600 w-10">10%</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm w-3">1</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className="h-3 rounded-full bg-gray-200" style={{ width: '5%' }} />
              </div>
              <span className="text-sm text-gray-600 w-10">5%</span>
            </div>
          </div>
        </div>
        {/* Right Column: Dress Type Ratings */}
        <div>
          <h4 className="text-xl font-medium text-gray-900 mb-6">Dress Type Ratings</h4>
          <div className="flex flex-col md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <span className="font-medium text-gray-900">Casual</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">4.2 stars</div>
                <div className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">15 reviews</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <span className="font-medium text-gray-900">Formal</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">4.5 stars</div>
                <div className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">25 reviews</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <span className="font-medium text-gray-900">Party</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">4.8 stars</div>
                <div className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">8 reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // const renderRatingForm = () => (
  //   <div className="w-full space-y-10">
  //     <div className="flex flex-col xl:flex-row xl:items-start xl:space-x-16 space-y-8 xl:space-y-0">
  //       <div className="text-center xl:text-left">
  //         <div className="text-6xl font-bold text-gray-900 mb-4">4.5</div>
  //         <div className="flex items-center justify-center xl:justify-start mb-4">
  //           {[...Array(4)].map((_, i) => (
  //             <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
  //               <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
  //             </svg>
  //           ))}
  //           <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
  //             <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
  //             <path d="M10 15V0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15z" fill="gray"/>
  //           </svg>
  //           {[...Array(0)].map((_, i) => (
  //             <svg key={i} className="w-6 h-6 text-gray-300 fill-current" viewBox="0 0 20 20">
  //               <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
  //             </svg>
  //           ))}
  //         </div>
  //         <div className="text-base text-gray-600">120 reviews</div>
  //       </div>
  //       <div className="flex-1 max-w-md">
  //         <div className="space-y-3">
  //           <div className="flex items-center space-x-4">
  //             <span className="text-sm w-3">5</span>
  //             <div className="flex-1 bg-gray-100 rounded-full h-3">
  //               <div className="h-3 rounded-full bg-gray-800" style={{ width: '40%' }} />
  //             </div>
  //             <span className="text-sm text-gray-600 w-10">40%</span>
  //           </div>
  //           <div className="flex items-center space-x-4">
  //             <span className="text-sm w-3">4</span>
  //             <div className="flex-1 bg-gray-100 rounded-full h-3">
  //               <div className="h-3 rounded-full bg-gray-600" style={{ width: '30%' }} />
  //             </div>
  //             <span className="text-sm text-gray-600 w-10">30%</span>
  //           </div>
  //           <div className="flex items-center space-x-4">
  //             <span className="text-sm w-3">3</span>
  //             <div className="flex-1 bg-gray-100 rounded-full h-3">
  //               <div className="h-3 rounded-full bg-gray-400" style={{ width: '15%' }} />
  //             </div>
  //             <span className="text-sm text-gray-600 w-10">15%</span>
  //           </div>
  //           <div className="flex items-center space-x-4">
  //             <span className="text-sm w-3">2</span>
  //             <div className="flex-1 bg-gray-100 rounded-full h-3">
  //               <div className="h-3 rounded-full bg-gray-300" style={{ width: '10%' }} />
  //             </div>
  //             <span className="text-sm text-gray-600 w-10">10%</span>
  //           </div>
  //           <div className="flex items-center space-x-4">
  //             <span className="text-sm w-3">1</span>
  //             <div className="flex-1 bg-gray-100 rounded-full h-3">
  //               <div className="h-3 rounded-full bg-gray-200" style={{ width: '5%' }} />
  //             </div>
  //             <span className="text-sm text-gray-600 w-10">5%</span>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     <div>
  //       <h4 className="text-xl font-medium text-gray-900 mb-6">Dress Type Ratings</h4>
  //       <div className="flex flex-col md:grid-cols-2 lg:grid-cols-3 gap-6">
  //         <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
  //           <div className="flex items-center space-x-4">
  //             <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
  //             <span className="font-medium text-gray-900">Casual</span>
  //           </div>
  //           <div className="text-right">
  //             <div className="text-sm font-medium text-gray-900">4.2 stars</div>
  //             <div className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">15 reviews</div>
  //           </div>
  //         </div>
  //         <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
  //           <div className="flex items-center space-x-4">
  //             <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
  //             <span className="font-medium text-gray-900">Formal</span>
  //           </div>
  //           <div className="text-right">
  //             <div className="text-sm font-medium text-gray-900">4.5 stars</div>
  //             <div className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">25 reviews</div>
  //           </div>
  //         </div>
  //         <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
  //           <div className="flex items-center space-x-4">
  //             <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
  //             <span className="font-medium text-gray-900">Party</span>
  //           </div>
  //           <div className="text-right">
  //             <div className="text-sm font-medium text-gray-900">4.8 stars</div>
  //             <div className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">8 reviews</div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

//  const renderSupportForm = () => (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
//         <div className="mb-6">
//           <h3 className="text-2xl font-semibold text-gray-900">Support Center</h3>
//           <p className="text-gray-600 mt-2 text-base">We're here to help you. Contact us for assistance.</p>
//         </div>
//         <div className="space-y-4 mb-6">
//           <p className="text-gray-600">
//             <span className="font-medium">Email:</span>{' '}
//             <a href="mailto:support@example.com" className="text-blue-500 hover:text-blue-600 underline">
//               support@example.com
//             </a>
//           </p>
//           <p className="text-gray-600">
//             <span className="font-medium">Phone:</span>{' '}
//             <a href="tel:+1234567890" className="text-blue-500 hover:text-blue-600 underline">
//               +1 (234) 567-890
//             </a>
//           </p>
//           <p className="text-gray-600">
//             <span className="font-medium">FAQ:</span>{' '}
//             <a href="/faq" className="text-blue-500 hover:text-blue-600 underline">
//               Visit our FAQ page
//             </a>
//           </p>
//           <p className="text-gray-600">
//             <span className="font-medium">Live Chat:</span>{' '}
//             <span className="text-gray-500">Available 9 AM - 6 PM IST</span>
//           </p>
//         </div>
//         <button
//           // onClick={handleSignOut}
//           className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
//         >
//           Sign Out
//         </button>
//       </div>
//     </div>
//   );

const renderSupportForm = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 space-y-8">
    {/* ---------- SUPPORT OPTIONS CARD ---------- */}
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md divide-y divide-gray-200">
      {/* FAQ Option */}
      <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 cursor-pointer transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2-6V6a2 2 0 00-2-2H9a2 2 0 00-2 2v4H5a2 2 0 00-2 2v6l4-2h10a2 2 0 002-2z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">FAQ</h4>
            <p className="text-sm text-gray-500">
              We have already answered most of your questions.
            </p>
          </div>
        </div>
        <span className="text-gray-400">&gt;</span>
      </div>

      {/* Live Chat Option */}
      <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 cursor-pointer transition-all">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v9l-4-2H7a2 2 0 01-2-2V8a2 2 0 012-2h2"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Live chat</h4>
            <p className="text-sm text-gray-500">
              Send a detailed support request for complex issues.
            </p>
          </div>
        </div>
        <span className="text-gray-400">&gt;</span>
      </div>
    </div>

    {/* ---------- FAQ SECTION ---------- */}
    <div className="w-full max-w-md">
      {[
        {
          q: "How do I manage my notifications?",
          a: 'To manage notifications, go to "Settings" → "Notification Settings," and customize your preferences.',
        },
        { q: "How do I start add products ?", a: "" },
        { q: "How do i edit my bank details?", a: "" },
        { q: "How do i change my password?", a: "" },
        { q: "Is my data safe and private?", a: "" },
      ].map((item, i) => (
        <details
          key={i}
          className="bg-sky-100 mb-2 rounded-lg text-gray-800 overflow-hidden"
        >
          <summary className="cursor-pointer py-3 px-4 font-medium">
            {item.q}
          </summary>
          {item.a && (
            <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">
              {item.a}
            </p>
          )}
        </details>
      ))}
    </div>

    {/* ---------- CHAT WINDOW ---------- */}
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-4 flex flex-col space-y-4">
      <div className="text-center text-sm text-gray-500">Today</div>

      {/* Messages */}
      <div className="space-y-3">
        <div className="bg-gray-100 px-4 py-2 rounded-xl max-w-[75%]">
          Hi, how are you today?
          <div className="text-xs text-gray-400 text-right mt-1">7:00</div>
        </div>

        <div className="bg-sky-400 text-white px-4 py-2 rounded-xl max-w-[75%] ml-auto">
          How to upload images
          <div className="text-xs text-gray-200 text-right mt-1">7:00</div>
        </div>

        <div className="bg-gray-100 px-4 py-2 rounded-xl max-w-[75%]">
          Do not panic, are you uploading single or bulk product?
          <div className="text-xs text-gray-400 text-right mt-1">7:00</div>
        </div>

        <div className="bg-sky-400 text-white px-4 py-2 rounded-xl max-w-[75%] ml-auto">
          I need to upload single product
          <div className="text-xs text-gray-200 text-right mt-1">7:00</div>
        </div>

        <div className="flex items-center space-x-1 text-gray-400 ml-2">
          <span className="text-2xl">•</span>
          <span className="text-2xl">•</span>
          <span className="text-2xl">•</span>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex items-center mt-4 bg-gray-50 rounded-full px-3 py-2">
        <input
          type="text"
          placeholder="Message..."
          className="flex-1 bg-transparent outline-none text-gray-700 text-sm px-2"
        />
        <div className="flex items-center space-x-2 text-gray-400">
          <button className="hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button className="hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2v6m0-6V8"
              />
            </svg>
          </button>
          <button className="bg-sky-500 p-2 rounded-full text-white hover:bg-sky-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10l9-6 9 6m-9 0v10"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
);


  switch (activeSection) {
    case 'account': return renderAccountForm();
    case 'vendor': return renderVendorForm();
    case 'shop': return renderShopForm();
    case 'payout': return renderPayoutForm();
    case 'rating': return renderRatingForm();
    case 'support': return renderSupportForm();
    default: return null;
  }
};

export default FormSection;