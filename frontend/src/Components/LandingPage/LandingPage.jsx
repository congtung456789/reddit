import "./landing.css";
import phoneMockup from "../../assets/phone.png";
import { useNavigate } from "react-router-dom";
import React, { Component }  from 'react';
const LandingPage = () => {
  const navigate = useNavigate();
  const goToSignIn = () => {
    navigate("/login");
  };
  const goToSignUp = () => {
    navigate("/register");
  };
  return (
    <section className="landing-container">
      <div className="landing-header"> FOURWAY <span className="beta"> Beta </span> </div>
      <div className="landing-sub">  connect everyone </div>
      <img src={phoneMockup} className="phone-mockup" alt="phone mockup" />
      <div className="button-container">
        <button className="login" onClick={goToSignIn}>
          Sign in
        </button>
        <button className="register" onClick={goToSignUp}>
          Sign up
        </button>
      </div>
    </section>
  );
};

export default LandingPage;
