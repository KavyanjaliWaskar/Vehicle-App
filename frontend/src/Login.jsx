import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {

  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [savingUser, setSavingUser] = useState(false);


  // ===============================
  // SEND OTP
  // ===============================

  const handleSendOtp = (e) => {

    e.preventDefault();

    if (mobile.length !== 10) {

      alert(
        "Please enter a valid 10-digit mobile number"
      );

      return;
    }


    const newOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();


    setGeneratedOtp(newOtp);

    setOtpSent(true);


    // Demo OTP

    alert(
      `Your OTP is: ${newOtp}`
    );

  };


  // ===============================
  // VERIFY OTP
  // ===============================

  const handleVerifyOtp = async (e) => {

    e.preventDefault();


    if (otp !== generatedOtp) {

      alert(
        "Invalid OTP. Please try again."
      );

      return;
    }


    try {

      setSavingUser(true);


      // Save / get user from backend

      const response = await fetch(
        "https://vehicle-app-1-9q1x.onrender.com/api/users",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            mobile: mobile,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "User could not be saved."
        );

        return;
      }


      // Save user details in browser

      localStorage.setItem(
        "userId",
        data.userId
      );


      localStorage.setItem(
        "mobile",
        mobile
      );


      alert(
        "Login successful! Welcome to Vehicle App."
      );


      navigate("/");


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      alert(
        "Unable to connect to server. Please try again."
      );

    } finally {

      setSavingUser(false);

    }

  };


  // ===============================
  // LOGIN PAGE
  // ===============================

  return (

    <div className="auth-page">

      <div className="auth-box">


        <div className="auth-logo">
          🚗
        </div>


        {!otpSent ? (

          <>

            <h2>
              Welcome to Vehicle App
            </h2>


            <p>
              Login with your mobile number
            </p>


            <form
              onSubmit={handleSendOtp}
            >

              <label>
                Mobile Number
              </label>


              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}

                onChange={(e) => {

                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );


                  if (value.length <= 10) {

                    setMobile(value);

                  }

                }}

              />


              <button
                type="submit"
              >
                Send OTP
              </button>


            </form>

          </>

        ) : (

          <>

            <h2>
              Verify OTP
            </h2>


            <p>
              OTP sent to +91 {mobile}
            </p>


            <form
              onSubmit={handleVerifyOtp}
            >

              <label>
                Enter OTP
              </label>


              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}

                onChange={(e) => {

                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );


                  if (value.length <= 6) {

                    setOtp(value);

                  }

                }}

              />


              <button
                type="submit"
                disabled={savingUser}
              >

                {savingUser
                  ? "Logging in..."
                  : "Verify OTP"
                }

              </button>


            </form>


            <button
              className="back-btn"

              onClick={() => {

                setOtpSent(false);

                setOtp("");

                setGeneratedOtp("");

              }}

            >
              Change Mobile Number
            </button>

          </>

        )}

      </div>

    </div>

  );

}


export default Login;