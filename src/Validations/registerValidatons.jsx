 
 export const  validateLoginForm = (data) => {
    const errors = {};
    if (!data.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Invalid email format";
    }
    if (!data.password.trim()) errors.password = "Password is required";
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  export const validateRegistrationForm = (data) => {
    const errors = {};
    if (!data.username.trim()) errors.username = "Username is required";
    if (!data.firstName.trim()) errors.firstName = "First name is required";
    if (!data.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Invalid email format";
    }
    if (!data.password.trim()) errors.password = "Password is required";
    else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!data.contactNumber || !/^\d{10}$/.test(data.contactNumber)) {
      errors.contactNumber = "Valid 10-digit mobile number is required";
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  export const validateShopDetails = (data) => {
    const errors = {};
    if (!data.shopName.trim()) errors.shopName = "Shop name is required";
    if (!data.shopAddress.trim()) errors.shopAddress = "Shop address is required";
    if (!data.city.trim()) errors.city = "City is required";
    if (!data.state.trim()) errors.state = "State is required";
    if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
      errors.pincode = "Valid 6-digit pincode is required";
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  export const validateBankDetails = (data) => {
    const errors = {};
    if (!data.bankName) errors.bankName = "Bank name is required";
    if (!data.branchName.trim()) errors.branchName = "Branch name is required";
    if (!data.accountHolder.trim())
      errors.accountHolder = "Account holder name is required";
    if (!data.accountNumber || !/^\d+$/.test(data.accountNumber)) {
      errors.accountNumber = "Valid account number is required";
    }
    if (data.accountNumber !== data.reAccountNumber) {
      errors.reAccountNumber = "Account numbers do not match";
    }
    if (!data.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) {
      errors.ifscCode = "Valid IFSC code is required";
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  export const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  export const validateGSTIN = (gstin) => {
    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  export const validateAadhar = (aadhar) => {
    const aadharRegex = /^[0-9]{12}$/;
    return aadharRegex.test(aadhar);
  };

 export const validateKycDetails = (kycDetails) => {
    const errors = {};

    if (!kycDetails.panNumber.trim()) {
      errors.panNumber = "PAN number is required";
    } else if (!validatePAN(kycDetails.panNumber)) {
      errors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    if (kycDetails.gstinNumber.trim()) {
      if (!validateGSTIN(kycDetails.gstinNumber)) {
        errors.gstinNumber = "Invalid GSTIN format (15 characters)";
      }
    }

    if (!kycDetails.aadharNumber.trim()) {
      errors.aadharNumber = "Aadhar number is required";
    } else if (!validateAadhar(kycDetails.aadharNumber)) {
      errors.aadharNumber = "Invalid Aadhar format (12 digits)";
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };



  