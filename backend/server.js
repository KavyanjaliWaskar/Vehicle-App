const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Vehicle App Backend is running!"
  });
});
app.get("/api/vehicles", (req, res) => {
  const sql = "SELECT * FROM vehicles WHERE available = TRUE";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching vehicles:", err);
      return res.status(500).json({
        message: "Failed to fetch vehicles"
      });
    }

    res.json(results);
  });
});
app.get("/api/distance", async (req, res) => {
  try {
    const { pickup, drop } = req.query;

    if (!pickup || !drop) {
      return res.status(400).json({
        message: "Pickup and drop locations are required"
      });
    }

    const geocode = async (place) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`,
        {
          headers: {
            "User-Agent": "VehicleApp/1.0"
          }
        }
      );

      const data = await response.json();

      if (!data.length) {
        throw new Error(`Location not found: ${place}`);
      }

      return {
        lat: Number(data[0].lat),
        lon: Number(data[0].lon)
      };
    };

    const start = await geocode(pickup);
    const end = await geocode(drop);

    const routeResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`
    );

    const routeData = await routeResponse.json();

    if (routeData.code !== "Ok") {
      throw new Error("Route could not be calculated");
    }

    const distanceKm = Number(
      (routeData.routes[0].distance / 1000).toFixed(2)
    );

    res.json({
      pickup,
      drop,
      distanceKm
    });

  } catch (error) {
    console.error("Distance error:", error.message);

    res.status(500).json({
      message: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});