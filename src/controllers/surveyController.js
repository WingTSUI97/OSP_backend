const Survey = require('../models/survey');
const generateToken = require('../utils/tokenGenerator');

const createSurvey = async (req, res) => {
    try {
        const { title, questions } = req.body;
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Title and at least one question are required' });
        }
        for (const question of questions) {
            if (!question.text || !question.type || !question.spec) {
                return res.status(400).json({ message: 'Each question must have text, type, and spec fields.' });
            }
        }

        const token = generateToken();

        const newSurvey = new Survey({ title, token, questions });
        await newSurvey.save();
        console.log('Survey created successfully');
        res
            .status(201)
            .json({ message: 'Survey created successfully', survey: newSurvey });

    } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, questions } = req.body;

        // Basic validation
        if (!title && !questions) {
            return res
                .status(400)
                .json({ message: 'At least one of title or questions must be provided for update' });
        }

        // questions validation if provided
        if (questions) {
            if (!Array.isArray(questions) || questions.length === 0) {
                return res
                    .status(400)
                    .json({ message: 'Questions must be a non-empty array' });
            };

            // Validate each question
            for (const question of questions) {
                if (!question.text || !question.type || !question.spec) {
                    return res
                        .status(400)
                        .json({ message: 'Each question must have text, type, and spec fields.' });
                }
            }
        };

        const updateSurvey = await Survey.findByIdAndUpdate(
            id,
            { title, questions },
            { new: true, runValidators: true }
        );

        if (!updateSurvey) {
            return res.status(404).json({ message: 'Survey not found' });
        };
        console.log('Survey updated successfully')
        res.status(200).json({
            message: 'Survey updated successfully',
            survey: updateSurvey
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid survey ID format' });
        };
        console.error('Error updating survey:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSurvey = await Survey.findByIdAndDelete(id);

        if (!deletedSurvey) {
            return res.status(404).json({ message: 'Survey not found' });
        }

        console.log('Survey deleted successfully')
        res.status(200).json({
            message: 'Survey deleted successfully',
            survey: deletedSurvey
        });

    } catch (error) {
        console.error('Error deleting survey:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSurveyByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const survey = await Survey.findOne({ token });

        if (!survey) {
            return res.status(404).json({ message: 'Survey not found' });
        }
        res.status(200).json({ survey });

    } catch (error) {
        console.error('Error fetching survey by token:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Export controller functions
module.exports = {
    createSurvey,
    updateSurvey,
    deleteSurvey,
    getSurveyByToken
};