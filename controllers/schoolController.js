const pool = require('../db');

// Helper function to calculate distance using Haversine Formula
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Radius of the earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Add a new school
const addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validation
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';

  pool.query(sql, [name, address, latitude, longitude], (err, results) => {
    if (err) {
      console.error('Error adding school:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    res.status(201).json({
      message: 'School added successfully.',
      schoolId: results.insertId,
    });
  });
};

// List schools sorted by proximity
const listSchools = (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }

  const sql = 'SELECT * FROM schools';

  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching schools:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    const sorted = results
      .map((school) => ({
        ...school,
        distance: getDistance(userLat, userLon, school.latitude, school.longitude),
      }))
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json(sorted);
  });
};

module.exports = {
  addSchool,
  listSchools,
};
