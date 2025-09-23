const Response = require('../models/response');
const Survey = require('../models/survey');

const getResponsesBySurveyId = async (req, res) => {
    try {
        const { id } = req.params;

        const survey = await Survey.findById(id);
        if (!survey) {
            return res.status(404).json({ message: 'Survey not found' });
        }

        const responses = await Response.find({ surveyId: id });
        
        console.log('Responses fetched successfully')
        res
            .status(200)
            .json({ message: 'Responses fetched successfully', responses });

    } catch (error) {
        if (error.name === 'CastError') {
            return res
                .status(400)
                .json({ message: 'Invalid survey ID format' });
        }
        console.error('Error fetching responses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const submitResponse = async (req, res) => {
    try {
        const { token } = req.params;
        const { answers } = req.body;

        // --- 1. Basic validation of token and answers
        if (!token) {
            return res.status(400).json({ message: 'Survey token is required' });
        }
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'Answers are required and should be a non-empty array' });
        }

        // --- 2. Find survey by token
        const survey = await Survey.findOne({ token });
        if (!survey) {
            return res.status(404).json({ message: 'Survey not found' });
        }

        // --- 3. Validate submitted answers against survey questions
        if (answers.length !== survey.questions.length) {
            return res.status(400).json({ message: 'Number of answers does not match number of questions in the survey' });
        }

        const validatedAnswers = [];
        for (const submittedAnswer of answers) {
            // Find corresponding question by its _id
            const question = survey.questions.id(submittedAnswer.questionId);
            if (!question) {
                return res.status(400).json({ message: `Invalid question ID: ${submittedAnswer.questionId}` });
            }

            // --- 4. Validate answer based on question type and specifications
            switch (question.type) {
                case 'TEXTBOX':
                    // Check for maxLength constraint, if it exists
                    if (question.spec.maxLength && submittedAnswer.value.length > question.spec.maxLength) {
                        return res.status(400).json({
                            message: `Answer for question ${question.id} exceeds maximum length of ${question.spec.maxLength}`
                        });
                    }
                    // Correctly push to validatedAnswers
                    validatedAnswers.push(submittedAnswer);
                    break;

                case 'MULTIPLE_CHOICE':
                    // Check if the answer is one of the options
                    if (!question.spec.choices.includes(submittedAnswer.value)) {
                        return res.status(400).json({
                            message: `Answer for question ${question.id} is not a valid choice`
                        });
                    }
                    // Correctly push to validatedAnswers
                    validatedAnswers.push(submittedAnswer);
                    break;

                case 'LIKERT':
                    // Check if the value is a number within the min-max range
                    const value = Number(submittedAnswer.value);
                    if (isNaN(value) || value < question.spec.min || value > question.spec.max) {
                        return res.status(400).json({
                            message: `Answer for question ${question.id} is out of range`
                        });
                    }
                    // Correctly push to validatedAnswers
                    validatedAnswers.push(submittedAnswer);
                    break;

                default:
                    // If question type is not supported
                    return res.status(400).json({
                        message: `Unsupported question type: ${question.type}`
                    });
            }
        }

        // --- 5. Create and save the new response
        const newResponse = await Response.create({
            surveyId: survey._id,
            answers: validatedAnswers
        });

        // --- 6. Success response
        res.status(201).json({
            message: 'Response submitted successfully',
            response: newResponse
        });

    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    getResponsesBySurveyId,
    submitResponse
};