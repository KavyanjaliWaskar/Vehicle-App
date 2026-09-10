const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "Vehicle App Backend is running!"
  });
});

// ===============================
// GET AVAILABLE VEHICLES
// ===============================
app.get("/api/vehicles", (req, res) => {
  const sql = `
    SELECT *
    FROM vehicles
    WHERE available = TRUE
  `;

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

// ===============================
// CREATE / GET USER
// ===============================
app.post("/api/users", (req, res) => {
  const { mobile } = req.body;

  if (!mobile || mobile.toString().length !== 10) {
    return res.status(400).json({
      message: "Valid 10-digit mobile number is required"
    });
  }

  const checkSql = `
    SELECT id, mobile, name
    FROM users
    WHERE mobile = ?
  `;

  db.query(checkSql, [mobile], (err, results) => {
    if (err) {
      console.error("User check error:", err);

      return res.status(500).json({
        message: "Failed to check user"
      });
    }

    // Existing user
    if (results.length > 0) {
      return res.json({
        message: "User already exists",
        userId: results[0].id,
        mobile: results[0].mobile
      });
    }

    // New user
    const insertSql = `
      INSERT INTO users (mobile)
      VALUES (?)
    `;

    db.query(insertSql, [mobile], (err, result) => {
      if (err) {
        console.error("User save error:", err);

        return res.status(500).json({
          message: "Failed to save user"
        });
      }

      console.log(
        "User saved successfully. User ID:",
        result.insertId
      );

      res.status(201).json({
        message: "User created successfully",
        userId: result.insertId,
        mobile: mobile
      });
    });
  });
});

// ===============================
// CALCULATE DISTANCE
// ===============================
app.get("/api/distance", async (req, res) => {
  try {
    const { pickup, drop } = req.query;

    if (!pickup || !drop) {
      return res.status(400).json({
        message: "Pickup and drop locations are required"
      });
    }

    // ===============================
    // GEOCODING
    // ===============================
    const geocode = async (place) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          place
        )}`,
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

    // ===============================
    // ROAD DISTANCE
    // ===============================
    const routeResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`
    );

    const routeData = await routeResponse.json();

    if (routeData.code !== "Ok") {
      throw new Error(
        routeData.message ||
          "Route could not be calculated"
      );
    }

    const distanceKm = Number(
      (
        routeData.routes[0].distance / 1000
      ).toFixed(2)
    );

    res.json({
      pickup,
      drop,
      distanceKm
    });
  } catch (error) {
    console.error(
      "Distance error:",
      error.message
    );

    res.status(500).json({
      message: error.message
    });
  }
});

// ===============================
// SAVE BOOKING
// ===============================
app.post("/api/bookings", (req, res) => {
  const {
    userId,
    mobile,
    vehicleId,
    vehicleName,
    pickup,
    drop,
    pickupDate,
    returnDate,
    distance,
    pricePerKm,
    totalFare
  } = req.body;

  // ===============================
  // BASIC VALIDATION
  // ===============================
  if (
    (!userId && !mobile) ||
    (!vehicleId && !vehicleName) ||
    !pickup ||
    !drop ||
    !pickupDate ||
    !returnDate ||
    !distance ||
    pricePerKm === undefined ||
    totalFare === undefined
  ) {
    return res.status(400).json({
      message: "All booking details are required"
    });
  }

  // ===============================
  // FIND / CREATE USER
  // ===============================
  const getUser = (callback) => {
    if (userId) {
      const sql = `
        SELECT id
        FROM users
        WHERE id = ?
      `;

      db.query(sql, [userId], (err, results) => {
        if (err) {
          return callback(err);
        }

        if (!results.length) {
          return callback(
            new Error("User not found")
          );
        }

        callback(null, results[0].id);
      });

      return;
    }

    const sql = `
      SELECT id
      FROM users
      WHERE mobile = ?
    `;

    db.query(sql, [mobile], (err, results) => {
      if (err) {
        return callback(err);
      }

      if (results.length > 0) {
        return callback(
          null,
          results[0].id
        );
      }

      const insertSql = `
        INSERT INTO users (mobile)
        VALUES (?)
      `;

      db.query(
        insertSql,
        [mobile],
        (err, result) => {
          if (err) {
            return callback(err);
          }

          callback(
            null,
            result.insertId
          );
        }
      );
    });
  };

  // ===============================
  // FIND VEHICLE
  // ===============================
  const getVehicle = (callback) => {
    if (vehicleId) {
      const sql = `
        SELECT id, name, price_per_km
        FROM vehicles
        WHERE id = ?
          AND available = TRUE
      `;

      db.query(
        sql,
        [vehicleId],
        (err, results) => {
          if (err) {
            return callback(err);
          }

          if (!results.length) {
            return callback(
              new Error(
                "Selected vehicle not found"
              )
            );
          }

          callback(null, results[0]);
        }
      );

      return;
    }

    const sql = `
      SELECT id, name, price_per_km
      FROM vehicles
      WHERE name = ?
        AND available = TRUE
      LIMIT 1
    `;

    db.query(
      sql,
      [vehicleName],
      (err, results) => {
        if (err) {
          return callback(err);
        }

        if (!results.length) {
          return callback(
            new Error(
              "Selected vehicle not found"
            )
          );
        }

        callback(null, results[0]);
      }
    );
  };

  // ===============================
  // GET USER THEN VEHICLE
  // ===============================
  getUser(
    (userError, finalUserId) => {
      if (userError) {
        console.error(
          "User error:",
          userError
        );

        return res.status(500).json({
          message: userError.message
        });
      }

      getVehicle(
        (vehicleError, vehicle) => {
          if (vehicleError) {
            console.error(
              "Vehicle error:",
              vehicleError
            );

            return res.status(500).json({
              message:
                vehicleError.message
            });
          }

          // ===============================
          // INSERT BOOKING
          // ===============================
          const sql = `
            INSERT INTO bookings
            (
              user_id,
              vehicle_id,
              pickup_location,
              drop_location,
              pickup_date,
              return_date,
              distance_km,
              price_per_km,
              total_amount,
              booking_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            finalUserId,
            vehicle.id,
            pickup,
            drop,
            pickupDate,
            returnDate,
            Number(distance),
            Number(pricePerKm),
            Number(totalFare),
            "Pending"
          ];

          db.query(
            sql,
            values,
            (err, result) => {
              if (err) {
                console.error(
                  "Booking save error:",
                  err
                );

                return res.status(500).json({
                  message:
                    "Failed to save booking"
                });
              }

              console.log(
                "Booking saved successfully. Booking ID:",
                result.insertId
              );

              res.status(201).json({
                message:
                  "Booking saved successfully",
                bookingId:
                  result.insertId,
                userId:
                  finalUserId,
                vehicleId:
                  vehicle.id
              });
            }
          );
        }
      );
    }
  );
});
// ===============================
// CANCEL BOOKING
// ===============================
app.put("/api/bookings/:bookingId/cancel", (req, res) => {
  const { bookingId } = req.params;

  const sql = `
    UPDATE bookings
    SET booking_status = 'Cancelled'
    WHERE id = ?
      AND booking_status = 'Pending'
  `;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error("Cancel booking error:", err);

      return res.status(500).json({
        message: "Failed to cancel booking"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Booking cannot be cancelled"
      });
    }

    res.json({
      message: "Booking cancelled successfully"
    });
  });
});

// ===============================
// GET USER BOOKING HISTORY
// ===============================
app.get(
  "/api/bookings/user/:userId",
  (req, res) => {
    const { userId } = req.params;

    const sql = `
      SELECT
        b.id,
        b.pickup_location,
        b.drop_location,
        b.pickup_date,
        b.return_date,
        b.distance_km,
        b.price_per_km,
        b.total_amount,
        b.booking_status,
        b.created_at,
        v.name AS vehicle_name,
        v.type AS vehicle_type
      FROM bookings b
      JOIN vehicles v
        ON b.vehicle_id = v.id
      WHERE b.user_id = ?
      ORDER BY b.id DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error(
          "Booking history error:",
          err
        );

        return res.status(500).json({
          message:
            "Failed to fetch booking history"
        });
      }

      res.json(results);
    });
  }
);

// ===============================
// START SERVER
// ===============================
app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);