import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./Login";
import Booking from "./Booking";
import { useState } from "react";
function Home() {
  const [vehicles, setVehicles] = useState([
  {
    name: "Honda Activa 125",
    type: "Bike",
    seats: 1,
    fuel: "Petrol",
    price: "₹8/km",
    price_per_km: 8
  },
  {
    name: "Bajaj RE Auto",
    type: "Auto",
    seats: 2,
    fuel: "CNG",
    price: "₹10/km",
    price_per_km: 10
  },
  {
    name: "Maruti Suzuki Swift",
    type: "Car",
    seats: 3,
    fuel: "Petrol",
    price: "₹14/km",
    price_per_km: 14
  },
  {
    name: "Hyundai Aura",
    type: "Cab",
    seats: 3,
    fuel: "Petrol",
    price: "₹16/km",
    price_per_km: 16
  },
  {
    name: "Hyundai Creta",
    type: "SUV",
    seats: 5,
    fuel: "Petrol",
    price: "₹20/km",
    price_per_km: 20
  },
  {
    name: "Toyota Innova HyCross",
    type: "Luxury",
    seats: 6,
    fuel: "Hybrid",
    price: "₹25/km",
    price_per_km: 25
  }
]);
  const [pickup, setPickup] = useState("");
const [drop, setDrop] = useState("");
const [pickupDate, setPickupDate] = useState("");
const [returnDate, setReturnDate] = useState("");
const [vehicleType, setVehicleType] = useState("");
const [searchResult, setSearchResult] = useState(null);
const [searching, setSearching] = useState(false);
const handleSearch = async () => {
  if (!pickup || !drop || !pickupDate || !returnDate) {
    alert("Please select pickup, drop and both dates.");
    return;
  }

  if (pickup === drop) {
    alert("Pickup and Drop location cannot be same.");
    return;
  }

  try {
    setSearching(true);
    const response = await fetch(
      `http://127.0.0.1:5000/api/distance?pickup=${encodeURIComponent(
        pickup
      )}&drop=${encodeURIComponent(drop)}`
    );

    const text = await response.text();

console.log("Server response:", text);

if (!response.ok) {
  alert("Server error: " + text);
  return;
}

const data = JSON.parse(text);

    if (!response.ok) {
      alert(data.message || "Could not calculate distance.");
      return;
    }

    const selectedVehicle = vehicles.find(
  (vehicle) => vehicle.type === vehicleType
);

const pricePerKm = selectedVehicle
  ? Number(selectedVehicle.price_per_km)
  : 0;

const totalFare = Number(
  (data.distanceKm * pricePerKm).toFixed(2)
);

setSearchResult({
  ...data,
  vehicleType: vehicleType || "All vehicles",
  pricePerKm,
  totalFare
});

  }  catch (error) {
  console.error("Search error:", error);
  alert("Unable to calculate distance. Please try again.");
} finally {
  setSearching(false);
}
};

  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">
  <div className="logo-box">
    <img src="/images/logo.png" alt="VehicleApp Logo" />
  </div>
          <div>
            Vehicle<span>App</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#home" className="active">
            Home
          </a>

          <a href="#vehicles">
            Vehicles
          </a>

          <a href="#services">
            Services
          </a>

          <a href="#about">
            About
          </a>

          <a href="#contact">
            Contact
          </a>
        </div>

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">
            Login
           </Link>

           
        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            ✨ Easy • Fast • Reliable
          </div>

          <h1>
            Your Journey,
            <br />
            <span>Our Vehicles.</span>
          </h1>

          <p>
            Find and book the perfect vehicle for your journey.
            Choose from bikes, autos, cabs, cars and SUVs at
            affordable prices.
          </p>

          <div className="hero-buttons">

            <button
  className="primary-btn"
  onClick={() => {
    document.getElementById("vehicles")?.scrollIntoView({
      behavior: "smooth"
    });
  }}
>
  Explore Vehicles
  <span>→</span>
</button>

            <button
  className="secondary-btn"
  onClick={() => {
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth"
    });
  }}
>
  ▶ How It Works
</button>

          </div>

          <div className="hero-stats">

            <div>
              <strong>10K+</strong>
              <span>Happy Customers</span>
            </div>

            <div>
              <strong>300+</strong>
              <span>Vehicles</span>
            </div>

            <div>
              <strong>4.9 ⭐</strong>
              <span>Customer Rating</span>
            </div>

          </div>

        </div>


        <div className="hero-visual">

          <div className="hero-circle"></div>

          <div className="hero-vehicle">
            🚙
          </div>

          <div className="floating-card rating-floating">

            <div className="floating-icon">
              ⭐
            </div>

            <div>
              <strong>4.9 / 5</strong>
              <small>Excellent Rating</small>
            </div>

          </div>


          <div className="floating-card booking-floating">

            <div className="floating-icon">
              ✓
            </div>

            <div>
              <strong>10,000+</strong>
              <small>Bookings Completed</small>
            </div>

          </div>

        </div>

      </section>


      {/* ================= SEARCH ================= */}

      <section className="search-section">
  <div className="search-box">

    {/* Pick-up Location */}
    <div className="search-item">
  <div className="search-icon">
    📍
  </div>

  <div>
    <label>Pick-up Location</label>

    <input
      type="text"
      placeholder="Enter pickup location"
      value={pickup}
      onChange={(e) => setPickup(e.target.value)}
    />
  </div>
</div>

    {/* Drop Location */}
    <div className="search-item">
  <div className="search-icon">
    📍
  </div>

  <div>
    <label>Drop Location</label>

    <input
      type="text"
      placeholder="Enter drop location"
      value={drop}
      onChange={(e) => setDrop(e.target.value)}
    />
  </div>
</div>

    {/* Pick-up Date */}
    <div className="search-item">
  <div className="search-icon">
    📅
  </div>

  <div>
    <label>Pick-up Date</label>

    <input
      type="date"
      value={pickupDate}
      onChange={(e) => setPickupDate(e.target.value)}
    />
  </div>
</div>

    {/* Return Date */}
    <div className="search-item">
  <div className="search-icon">
    📅
  </div>

  <div>
    <label>Return Date</label>

    <input
      type="date"
      value={returnDate}
      onChange={(e) => setReturnDate(e.target.value)}
    />
  </div>
</div>

    {/* Vehicle Type */}
    <div className="search-item">
  <div className="search-icon">
    🚘
  </div>

  <div>
    <label>Vehicle Type</label>

    <select
      value={vehicleType}
      onChange={(e) => setVehicleType(e.target.value)}
    >
      <option value="">All vehicles</option>
      <option value="Bike">Bike</option>
      <option value="Auto">Auto</option>
      <option value="Car">Car</option>
      <option value="Cab">Cab</option>
      <option value="SUV">SUV</option>
      <option value="Luxury">Luxury</option>
    </select>
  </div>
</div>

    {/* Search Button */}
    <button className="search-btn" onClick={handleSearch}>
  {searching ? "Searching..." : "Search"}
  {!searching && <span>🔍</span>}
</button>

  </div>
</section>
{searchResult && (
  <div className="search-result">
    <h3>Trip Details</h3>

    <p>
      <strong>Pickup:</strong> {searchResult.pickup}
    </p>

    <p>
      <strong>Drop:</strong> {searchResult.drop}
    </p>

    <p>
      <strong>Distance:</strong> {searchResult.distanceKm} km
    </p>

    <p>
      <strong>Vehicle:</strong> {searchResult.vehicleType}
    </p>

    <p>
      <strong>Rate:</strong> ₹{searchResult.pricePerKm}/km
    </p>

    <p>
      <strong>Total Fare:</strong> ₹{searchResult.totalFare}
    </p>
  </div>
)}

      {/* ================= VEHICLE CATEGORIES ================= */}

      <section className="section" id="services">

        <div className="section-header">

          <div>
            <span className="section-label">
              VEHICLE CATEGORIES
            </span>

            <h2>
              Choose Your Ride
            </h2>

            <p>
              Select the vehicle that matches your journey.
            </p>
          </div>

          <button className="view-all-btn">
            View All →
          </button>

        </div>


        <div className="categories">

          <div className="category-card active-category">
            <div className="category-icon">
              🚗
            </div>

            <h3>Cars</h3>

            <p>120+ Vehicles</p>
          </div>


          <div className="category-card">
            <div className="category-icon">
              🏍️
            </div>

            <h3>Bikes</h3>

            <p>80+ Vehicles</p>
          </div>


          <div className="category-card">
            <div className="category-icon">
              🛺
            </div>

            <h3>Auto</h3>

            <p>40+ Vehicles</p>
          </div>


          <div className="category-card">
            <div className="category-icon">
              🚕
            </div>

            <h3>Cabs</h3>

            <p>60+ Vehicles</p>
          </div>


          <div className="category-card">
            <div className="category-icon">
              🚙
            </div>

            <h3>SUVs</h3>

            <p>50+ Vehicles</p>
          </div>


          <div className="category-card">
            <div className="category-icon">
              🚐
            </div>

            <h3>Luxury</h3>

            <p>30+ Vehicles</p>
          </div>

        </div>

      </section>


      {/* ================= FEATURED VEHICLES ================= */}

      <section className="vehicles-section" id="vehicles">

        <div className="section-header">

          <div>
            <span className="section-label">
              POPULAR VEHICLES
            </span>

            <h2>
              Featured Vehicles
            </h2>

            <p>
              Well-maintained vehicles ready for your next trip.
            </p>
          </div>

          <button
  className="view-all-btn"
  onClick={() => {
    document.getElementById("vehicles")?.scrollIntoView({
      behavior: "smooth"
    });
  }}
>
  View All Vehicles →
</button>

        </div>


        <div className="vehicle-grid">

          {vehicles.map((vehicle, index) => (

            <div className="vehicle-card" key={index}>

              <div className="vehicle-image">

                <span className="vehicle-type">
                  {vehicle.type}
                </span>

                <button className="favorite-btn">
                  ♡
                </button>

                <div className="vehicle-icon-large">
  {vehicle.type === "Bike" && (
    <img src="/images/bike.jpeg" alt="Honda Activa" />
  )}

  {vehicle.type === "Auto" && (
    <img src="/images/auto.jpeg" alt="Bajaj RE Auto" />
  )}

  {vehicle.type === "Car" && (
    <img src="/images/car.jpeg" alt="Maruti Suzuki Swift" />
  )}

  {vehicle.type === "Cab" && (
    <img src="/images/cab.jpeg" alt="Hyundai Aura" />
  )}

  {vehicle.type === "SUV" && (
    <img src="/images/suv.jpeg" alt="Hyundai Creta" />
  )}

  {vehicle.type === "Luxury" && (
    <img src="/images/luxury.jpeg" alt="Toyota Innova HyCross" />
  )}
</div>

              </div>


              <div className="vehicle-info">

                <div className="vehicle-name-row">

                  <h3>
                    {vehicle.name}
                  </h3>

                  <span className="rating">
                    ⭐ 4.8
                  </span>

                </div>


                <div className="vehicle-details">

                  <span>
                    👥 {vehicle.seats}
                  </span>

                  <span>
                    ⛽ {vehicle.fuel}
                  </span>

                </div>


                <div className="vehicle-footer">

                  <div className="price">

                    <strong>
                      {vehicle.price}
                    </strong>

                  

                  </div>

                  <Link
  to="/booking"
  state={{ vehicle }}
  className="rent-btn"
>
  Rent Now
</Link>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* ================= WHY CHOOSE US ================= */}

      <section className="about-section" id="about">

        <div className="about-content">

          <span className="section-label">
            WHY VEHICLE APP
          </span>

          <h2>
            Everything You Need
            <br />
            For A Better Journey.
          </h2>

          <p>
            Vehicle App makes vehicle rental simple, transparent
            and convenient. Choose your vehicle, select your
            dates and start your journey.
          </p>

          <button className="primary-btn">
            Learn More →
          </button>

        </div>


        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-icon">
              💰
            </div>

            <h3>
              Best Prices
            </h3>

            <p>
              Affordable rental plans with transparent pricing
              and no hidden charges.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🛡️
            </div>

            <h3>
              Safe & Reliable
            </h3>

            <p>
              Clean and well-maintained vehicles for a
              comfortable journey.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ⚡
            </div>

            <h3>
              Quick Booking
            </h3>

            <p>
              Book your preferred vehicle in just a few
              simple steps.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📞
            </div>

            <h3>
              24/7 Support
            </h3>

            <p>
              Our support team is available whenever
              you need assistance.
            </p>

          </div>

        </div>

      </section>


      {/* ================= CALL TO ACTION ================= */}

      <section className="cta-section" id="contact">

        <div>

          <span>
            READY TO START YOUR JOURNEY?
          </span>

          <h2>
            Find Your Perfect Vehicle Today.
          </h2>

          <p>
            Book your ride and enjoy a comfortable journey.
          </p>

        </div>

        <button className="cta-btn">
          Start Booking →
        </button>

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <div className="footer-top">

          <div className="footer-brand">

            <div className="footer-logo">
              🚗 Vehicle<span>App</span>
            </div>

            <p>
              Your trusted platform for easy, affordable
              and reliable vehicle rentals.
            </p>

          </div>


          <div className="footer-column">

            <h4>
              Company
            </h4>

            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
            <a href="#home">Home</a>

          </div>


          <div className="footer-column">

            <h4>
              Vehicles
            </h4>

            <a href="#vehicles">Cars</a>
            <a href="#vehicles">Bikes</a>
            <a href="#vehicles">Auto & Cabs</a>

          </div>


          <div className="footer-column">

            <h4>
              Support
            </h4>

            <a href="#contact">Help Center</a>
            <a href="#contact">Contact Support</a>
            <a href="#contact">Terms & Conditions</a>

          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © 2026 Vehicle App. All rights reserved.
          </p>

          <div>
            Made for a better journey 🚗
          </div>

        </div>

      </footer>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booking" element={<Booking />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;