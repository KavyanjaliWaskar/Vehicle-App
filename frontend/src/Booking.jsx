import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedVehicle = location?.state?.vehicle;

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [distance, setDistance] = useState("");

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingOtp, setBookingOtp] = useState("");
  const [bookingId, setBookingId] = useState("");

  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);


  // ===============================
  // CALCULATE DISTANCE
  // ===============================

  useEffect(() => {
    const calculateDistance = async () => {

      if (!pickup || !drop || pickup === drop) {
        setDistance("");
        return;
      }

      if (
        pickup.trim().length < 3 ||
        drop.trim().length < 3
      ) {
        setDistance("");
        return;
      }

      try {

        setCalculatingDistance(true);

        const response = await fetch(
          `https://vehicle-app-1-9q1x.onrender.com/api/distance?pickup=${encodeURIComponent(
            pickup
          )}&drop=${encodeURIComponent(drop)}`
        );

        const data = await response.json();

        if (response.ok) {
          setDistance(data.distanceKm);
        } else {
          setDistance("");
          console.log(
            "Distance error:",
            data.message
          );
        }

      } catch (error) {

        console.error(
          "Distance calculation error:",
          error
        );

        setDistance("");

      } finally {

        setCalculatingDistance(false);

      }
    };


    const timer = setTimeout(() => {
      calculateDistance();
    }, 1000);


    return () => clearTimeout(timer);

  }, [pickup, drop]);


  // ===============================
  // DEFAULT VEHICLE
  // ===============================

  const vehicle = selectedVehicle || {
    name: "Toyota Innova",
    icon: "🚐",
    price_per_km: 22,
    price: 22,
    seats: 6,
    fuel: "Diesel",
  };


  // ===============================
  // TOTAL FARE
  // ===============================

  const totalAmount = distance
    ? Number(
        (
          Number(distance) *
          Number(vehicle.price_per_km)
        ).toFixed(2)
      )
    : 0;


  // ===============================
  // CONFIRM BOOKING
  // ===============================

  const handleBooking = async (e) => {

    e.preventDefault();


    // ===============================
    // CHECK LOGIN
    // ===============================

    const userId =
      localStorage.getItem("userId");


    if (!userId) {

      alert(
        "Please login first to continue booking."
      );

      navigate("/login");

      return;
    }


    // ===============================
    // CHECK DETAILS
    // ===============================

    if (
      !pickup ||
      !drop ||
      !pickupDate ||
      !returnDate ||
      !distance
    ) {

      alert(
        "Please fill all booking details."
      );

      return;
    }


    // ===============================
    // PICKUP / DROP VALIDATION
    // ===============================

    if (
      pickup.trim().toLowerCase() ===
      drop.trim().toLowerCase()
    ) {

      alert(
        "Pick-up and Drop location cannot be same."
      );

      return;
    }


    // ===============================
    // DATE VALIDATION
    // ===============================

    if (returnDate < pickupDate) {

      alert(
        "Return date cannot be before pick-up date."
      );

      return;
    }


    // ===============================
    // DISTANCE VALIDATION
    // ===============================

    if (Number(distance) <= 0) {

      alert(
        "Please enter valid locations."
      );

      return;
    }


    try {

      setSavingBooking(true);


      // ===============================
      // GENERATE BOOKING OTP
      // ===============================

      const newBookingOtp =
        Math.floor(
          100000 +
          Math.random() * 900000
        ).toString();


      // ===============================
      // BOOKING DATA
      // ===============================

      const bookingData = {

        userId: Number(userId),

        pickup: pickup,

        drop: drop,

        pickupDate: pickupDate,

        returnDate: returnDate,

        distance: Number(distance),

        vehicleName: vehicle.name,

        pricePerKm:
          Number(vehicle.price_per_km),

        totalFare:
          Number(totalAmount),

        bookingOtp: newBookingOtp,
      };


      console.log(
        "Booking data:",
        bookingData
      );


      // ===============================
      // SEND BOOKING TO BACKEND
      // ===============================

      const response = await fetch(
        "https://vehicle-app-1-9q1x.onrender.com/api/bookings",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(
            bookingData
          ),
        }
      );


      const data =
        await response.json();


      // ===============================
      // BACKEND ERROR
      // ===============================

      if (!response.ok) {

        console.error(
          "Booking save error:",
          data
        );

        alert(
          data.message ||
          "Booking could not be saved. Please try again."
        );

        return;
      }


      // ===============================
      // BOOKING SUCCESS
      // ===============================

      console.log(
        "Booking saved:",
        data
      );


      setBookingOtp(
        newBookingOtp
      );

      setBookingId(
        data.bookingId
      );

      setBookingConfirmed(
        true
      );


    } catch (error) {

      console.error(
        "Booking error:",
        error
      );

      alert(
        "Unable to save booking. Please check your internet connection and try again."
      );

    } finally {

      setSavingBooking(false);

    }

  };


  // ===============================
  // BOOKING SUCCESS SCREEN
  // ===============================

  if (bookingConfirmed) {

    return (

      <div className="booking-page">

        <div className="booking-success">

          <div className="success-icon">
            ✅
          </div>


          <h1>
            Booking Confirmed!
          </h1>


          <p>
            Your {vehicle.name} has been booked successfully.
          </p>


          {bookingId && (
            <p>
              <strong>
                Booking ID:
              </strong>{" "}
              #{bookingId}
            </p>
          )}


          <div className="booking-otp-box">

            <span>
              Driver OTP
            </span>

            <strong>
              {bookingOtp}
            </strong>

            <small>
              Share this OTP with the driver
            </small>

          </div>


          <div className="booking-summary">

            <p>
              <strong>
                Pick-up:
              </strong>{" "}
              {pickup}
            </p>


            <p>
              <strong>
                Drop:
              </strong>{" "}
              {drop}
            </p>


            <p>
              <strong>
                Pick-up Date:
              </strong>{" "}
              {pickupDate}
            </p>


            <p>
              <strong>
                Return Date:
              </strong>{" "}
              {returnDate}
            </p>


            <p>
              <strong>
                Distance:
              </strong>{" "}
              {distance} km
            </p>


            <p>
              <strong>
                Vehicle:
              </strong>{" "}
              {vehicle.name}
            </p>


            <p>
              <strong>
                Rate:
              </strong>{" "}
              ₹{vehicle.price_per_km}/km
            </p>


            <p className="total-price">
              Total Fare: ₹{totalAmount}
            </p>

          </div>


          <button
            className="back-home-btn"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Home
          </button>

        </div>

      </div>

    );

  }


  // ===============================
  // BOOKING FORM
  // ===============================

  return (

    <div className="booking-page">

      <div className="booking-container">


        {/* SELECTED VEHICLE */}

        <div className="selected-vehicle">

          <div className="selected-icon">
            {vehicle.icon}
          </div>


          <div>

            <h2>
              {vehicle.name}
            </h2>


            <p>
              {vehicle.seats} Seats •{" "}
              {vehicle.fuel} • ₹
              {vehicle.price_per_km}/km
            </p>

          </div>

        </div>


        {/* BOOKING CARD */}

        <div className="booking-card">

          <h1>
            Complete Your Booking
          </h1>


          <p>
            Enter your journey details to continue.
          </p>


          <form
            onSubmit={handleBooking}
          >


            {/* PICKUP + DROP */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Pick-up Location
                </label>


                <input
                  type="text"
                  placeholder="e.g. Kolhapur, Maharashtra"
                  value={pickup}
                  onChange={(e) =>
                    setPickup(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Drop Location
                </label>


                <input
                  type="text"
                  placeholder="e.g. Goa, India"
                  value={drop}
                  onChange={(e) =>
                    setDrop(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* DATES */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Pick-up Date
                </label>


                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) =>
                    setPickupDate(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Return Date
                </label>


                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) =>
                    setReturnDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* DISTANCE */}

            <div className="form-group">

              <label>
                Distance (KM)
              </label>


              <input
                type="text"
                value={
                  calculatingDistance
                    ? "Calculating distance..."
                    : distance
                    ? `${distance} km`
                    : "Enter pickup and drop location"
                }
                readOnly
              />

            </div>


            {/* FARE */}

            <div className="fare-box">

              <div>

                <span>
                  Rate
                </span>

                <strong>
                  ₹{vehicle.price_per_km}/km
                </strong>

              </div>


              <div>

                <span>
                  Distance
                </span>

                <strong>
                  {distance
                    ? distance
                    : 0}{" "}
                  km
                </strong>

              </div>


              <div className="fare-total">

                <span>
                  Estimated Fare
                </span>

                <strong>
                  ₹{totalAmount}
                </strong>

              </div>

            </div>


            {/* CONFIRM BUTTON */}

            <button
              type="submit"
              className="confirm-booking-btn"
              disabled={
                savingBooking ||
                calculatingDistance
              }
            >

              {savingBooking
                ? "Saving Booking..."
                : calculatingDistance
                ? "Calculating Distance..."
                : "Confirm Booking →"}

            </button>


          </form>

        </div>

      </div>

    </div>

  );
}


export default Booking;