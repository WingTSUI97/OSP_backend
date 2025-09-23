const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { createSurvey, updateSurvey, deleteSurvey } = require('../controllers/surveyController');
const { getResponsesBySurveyId } = require('../controllers/responseController');

// All routes in this file are for the Admin persona and should be protected.
// We'll use the 'isAdmin' middleware for authorization.

// @route   POST /api/admin/surveys
// @desc    Create a new survey (Admin only)
// @access  Private (Admin)
router.post('/surveys', authMiddleware, isAdmin, createSurvey);
// router.post('/surveys', createSurvey); // Temporarily disabled isAdmin for testing

// @route   PUT /api/admin/surveys/:id
// @desc    Update a survey by its ID (Admin only)
// @access  Private (Admin)
router.put('/surveys/:id', authMiddleware, isAdmin, updateSurvey);
// router.put('/surveys/:id', updateSurvey); // Temporarily disabled isAdmin for testing


// @route   DELETE /api/admin/surveys/:id
// @desc    Delete a survey by its ID (Admin only)
// @access  Private (Admin)
router.delete('/surveys/:id', authMiddleware, isAdmin, deleteSurvey);
// router.delete('/surveys/:id', deleteSurvey); // Temporarily disabled isAdmin for testing

// @route   GET /api/admin/surveys/:id/responses
// @desc    Get all responses for a specific survey (Admin only)
// @access  Private (Admin)
router.get('/surveys/:id/responses', authMiddleware, isAdmin, getResponsesBySurveyId);
// router.get('/surveys/:id/responses', getSurveyByToken); // Temporarily disabled isAdmin for testing

module.exports = router;