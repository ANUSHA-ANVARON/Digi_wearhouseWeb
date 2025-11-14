  const  openRegGate = (msg) => {
    if (msg) setGateMessage(msg);
    setShowRegGate(true);
  };
  const closeRegGate = () => setShowRegGate(false);
  const goToRegisterFromGate = () => {
    setShowRegGate(false);
    setCurrentStep("register");
    navigate("/register");
  };
