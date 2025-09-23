const express = require('express');
const router = express.Router();
const { getSurveyByToken } = require('../controllers/surveyController');
const { submitResponse } = require('../controllers/responseController');

// All routes in this file are for the Participant persona.

// @route   GET /api/surveys/:token
// @desc    Get a survey by its public token (Participant)
// @access  Public
router.get('/surveys/:token', getSurveyByToken);

// @route   POST /api/surveys/:token/responses
// @desc    Submit a new response for a specific survey (Participant)
// @access  Public
router.post('/surveys/:token/responses', submitResponse);

module.exports = router;