import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  // Forgot password states
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {login} = useContext(AuthContext);

  const onSubmitHandler = (event)=>{
    event.preventDefault();

    if(currState === 'Sign up' && !isDataSubmitted){
      setIsDataSubmitted(true);
      return;
    }

    login(currState=== "Sign up" ? 'signup' : 'login', {fullName, email, password, bio});
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter email");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/send-otp", { email });
      if (data.success) {
        toast.success(data.message);
        setOtpSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error("Please fill in OTP and new password");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/reset-password", { email, otp, newPassword });
      if (data.success) {
        toast.success(data.message);
        setCurrState("Login");
        setOtp("");
        setNewPassword("");
        setOtpSent(false);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>

      {/* -------- left -------- */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]'/>

      {/* -------- right -------- */}

      <form onSubmit={
        currState === "Forgot Password" 
          ? (otpSent ? handleResetPassword : handleSendOtp)
          : onSubmitHandler
      } className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg w-full max-w-md'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && <img onClick={()=> setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>}
        </h2>

        {currState === "Sign up" && !isDataSubmitted && (
          <input onChange={(e)=>setFullName(e.target.value)} value={fullName}
           type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none bg-transparent text-white' placeholder="Full Name" required/>
        )}

        {currState !== "Forgot Password" && !isDataSubmitted && (
          <>
            <input onChange={(e)=>setEmail(e.target.value)} value={email}
             type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white'/>
            <input onChange={(e)=>setPassword(e.target.value)} value={password}
             type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white'/>
          </>
        )}

        {currState === "Forgot Password" && (
          <div className="flex flex-col gap-4">
            {!otpSent ? (
              <>
                <p className="text-sm text-gray-400">Enter your registered email to receive a verification OTP.</p>
                <input 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email}
                  type="email" 
                  placeholder='Email Address' 
                  required 
                  className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white'
                />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400 font-medium">OTP sent to {email}</p>
                <input 
                  onChange={(e) => setOtp(e.target.value)} 
                  value={otp}
                  type="text" 
                  placeholder='6-Digit OTP' 
                  required 
                  className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white'
                />
                <input 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  value={newPassword}
                  type="password" 
                  placeholder='New Password' 
                  required 
                  className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white'
                />
              </>
            )}
          </div>
        )}

        {currState === "Sign up" && isDataSubmitted && (
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio}
             rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white' placeholder='provide a short bio...' required></textarea>
        )}

        <button type='submit' disabled={loading} className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-50 font-medium'>
          {loading ? "Processing..." : (
            currState === "Forgot Password" 
              ? (otpSent ? "Reset Password" : "Send OTP") 
              : (currState === "Sign up" ? "Create Account" : "Login Now")
          )}
        </button>

        {currState !== "Forgot Password" && (
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <input type="checkbox" required />
            <p>Agree to the terms of use & privacy policy.</p>
          </div>
        )}

        <div className='flex flex-col gap-2'>
          {currState === "Sign up" ? (
            <p className='text-sm text-gray-600'>Already have an account? <span onClick={()=>{setCurrState("Login"); setIsDataSubmitted(false)}} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
          ) : currState === "Login" ? (
            <>
              <p className='text-sm text-gray-600'>Create an account <span onClick={()=> setCurrState("Sign up")} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
              <p className='text-sm text-gray-600'>Forgot password? <span onClick={() => { setCurrState("Forgot Password"); setOtpSent(false); }} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
            </>
          ) : (
            <p className='text-sm text-gray-600'>Back to <span onClick={() => { setCurrState("Login"); setOtpSent(false); }} className='font-medium text-violet-500 cursor-pointer'>Login</span></p>
          )}
        </div>
         
      </form>
    </div>
  );
};

export default LoginPage;
