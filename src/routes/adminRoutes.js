const express = require('express');
const router = express.Router();

const {isAdmin} = require('../middlewares/roleMiddleware');
const {createSurvey, updateSurvey, deleteSurvey, getSurveyByToken} = require('../controllers/surveyController');

// All routes in this file are for the Admin persona and should be protected.
// We'll use the 'isAdmin' middleware for authorization.

// @route   POST /api/admin/surveys
// @desc    Create a new survey (Admin only)
// @access  Private (Admin)
router.post('/surveys', isAdmin, createSurvey);

// @route   PUT /api/admin/surveys/:id
// @desc    Update a survey by its ID (Admin only)
// @access  Private (Admin)
router.put('/surveys/:id', isAdmin, updateSurvey);

// @route   DELETE /api/admin/surveys/:id
// @desc    Delete a survey by its ID (Admin only)
// @access  Private (Admin)
router.delete('/surveys/:id', isAdmin, deleteSurvey);

// @route   GET /api/admin/surveys/:id/responses
// @desc    Get all responses for a specific survey (Admin only)
// @access  Private (Admin)
router.get('/surveys/:id/responses', isAdmin, getSurveyByToken);

module.exports = router;