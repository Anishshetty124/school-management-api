const express = require('express');
const router = express.Router();
const {
  addSchool,
  listSchools,
} = require('../controllers/schoolController');

// POST /api/schools/add
router.post('/add', addSchool);

// GET /api/schools/list
router.get('/list', listSchools);

module.exports = router;
