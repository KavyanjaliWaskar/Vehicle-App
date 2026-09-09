import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Booking.css";

function Booking() {
    const location = useLocation();
    const selectedVehicle = location.state?.vehicle;
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [distance, setDistance] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingOtp, setBookingOtp] = useState("");
  useEffect(() => {
  const calculateDistance = async () => {
    if (!pickup || !drop || pickup === drop) {
      setDistance("");
      return;
    }

    try {
      const response = await fetch(
        ``https://vehicle-app-1-9q1x.onrender.com/api/distance?pickup=${encodeURIComponent(
          pickup
        )}&drop=${encodeURIComponent(drop)}`
      );

      const data = await response.json();

      if (response.ok) {
        setDistance(data.distanceKm);
      } else {
        setDistance("");
      }
    } catch (error) {
      console.error("Distance calculation error:", error);
      setDistance("");
    }
  };

  calculateDistance();
}, [pickup, drop]);

  const vehicle = selectedVehicle || {
  name: "Toyota Innova",
  icon: "🚐",
  price_per_km: 22,
  seats: 6,
  fuel: "Diesel",
};

  const totalAmount = distance
  ? Number(distance) * Number(vehicle.price_per_km)
  : 0;
  const handleBooking = (e) => {
    e.preventDefault();

    if (!pickup || !drop || !pickupDate || !returnDate || !distance) {
      alert("Please fill all booking details");
      return;
    }

    if (pickup === drop) {
      alert("Pick-up and Drop location cannot be same");
      return;
    }
    if (returnDate < pickupDate) {
  alert("Return date cannot be before pick-up date.");
  return;
}

    if (Number(distance) <= 0) {
      alert("Please enter valid distance");
      return;
    }
    const newBookingOtp = Math.floor(
  100000 + Math.random() * 900000
).toString();

setBookingOtp(newBookingOtp);

setBookingConfirmed(true);

  };

  if (bookingConfirmed) {
    return (
      <div className="booking-page">
        <div className="booking-success">
          <div className="success-icon">✅</div>

          <h1>Booking Confirmed!</h1>

          <p>
  Your {vehicle.name} has been booked successfully.
</p>

<div className="booking-otp-box">
  <span>Driver OTP</span>
  <strong>{bookingOtp}</strong>
  <small>Share this OTP with the driver</small>
</div>

          <div className="booking-summary">
            <p>
              <strong>Pick-up:</strong> {pickup}
            </p>

            <p>
              <strong>Drop:</strong> {drop}
            </p>

            <p>
              <strong>Pick-up Date:</strong> {pickupDate}
            </p>

            <p>
              <strong>Return Date:</strong> {returnDate}
            </p>

            <p>
              <strong>Distance:</strong> {distance} km
            </p>
            <p>
  <strong>Vehicle:</strong> {vehicle.name}
</p>

<p>
  <strong>Rate:</strong> ₹{vehicle.price_per_km}/km
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

  return (
    <div className="booking-page">
      <div className="booking-container">

        {/* Vehicle */}
        <div className="selected-vehicle">
          <div className="selected-icon">
            {vehicle.icon}
          </div>

          <div>
            <h2>{vehicle.name}</h2>
            <p>
              {vehicle.seats} • {vehicle.fuel} • ₹
              {vehicle.price}/km
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="booking-card">
          <h1>Complete Your Booking</h1>
          <p>
            Enter your journey details to continue.
          </p>

          <form onSubmit={handleBooking}>

            <div className="form-row">

              <div className="form-group">
                <label>Pick-up Location</label>

                <input
                  type="text"
                  placeholder="Enter pick-up location"
                  value={pickup}
                  onChange={(e) =>
                    setPickup(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Drop Location</label>

                <input
                  type="text"
                  placeholder="Enter drop location"
                  value={drop}
                  onChange={(e) =>
                    setDrop(e.target.value)
                  }
                />
              </div>

            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Pick-up Date</label>

                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) =>
                    setPickupDate(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Return Date</label>

                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) =>
                    setReturnDate(e.target.value)
                  }
                />
              </div>

            </div>

            <div className="form-group">
  <label>Distance (KM)</label>
  <input
    type="text"
    value={
      distance
        ? `${distance} km`
        : "Enter pickup and drop location"
    }
    readOnly
  />
</div>

            {/* Fare */}
            <div className="fare-box">
              <div>
                <span>Rate</span>
                <strong>₹{vehicle.price}/km</strong>
              </div>

              <div>
                <span>Distance</span>
                <strong>
                  {distance ? distance : 0} km
                </strong>
              </div>

              <div className="fare-total">
                <span>Estimated Fare</span>
                <strong>₹{totalAmount}</strong>
              </div>
            </div>

            <button
              type="submit"
              className="confirm-booking-btn"
            >
              Confirm Booking →
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Booking;