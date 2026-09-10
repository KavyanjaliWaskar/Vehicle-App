import { useEffect, useState } from "react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    fetch(
      `https://vehicle-app-1-9q1x.onrender.com/api/bookings/user/${userId}`
    )
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error(err));
  }, [userId]);

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      const res = await fetch(
        `https://vehicle-app-1-9q1x.onrender.com/api/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Unable to cancel booking");
        return;
      }

      alert("Booking cancelled successfully");

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, booking_status: "Cancelled" }
            : booking
        )
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  if (!userId) {
    return <h2>Please login first.</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h2>{booking.vehicle_name}</h2>

            <p>
              <strong>Pickup:</strong> {booking.pickup_location}
            </p>

            <p>
              <strong>Drop:</strong> {booking.drop_location}
            </p>

            <p>
              <strong>Distance:</strong> {booking.distance_km} km
            </p>

            <p>
              <strong>Total Fare:</strong> ₹{booking.total_amount}
            </p>

            <p>
              <strong>Status:</strong> {booking.booking_status}
            </p>

            {booking.booking_status === "Pending" && (
              <button
                onClick={() => cancelBooking(booking.id)}
                style={{
                  padding: "10px 18px",
                  cursor: "pointer",
                }}
              >
                Cancel Booking
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;