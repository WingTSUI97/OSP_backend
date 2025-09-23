const Response = require('../models/response');
const Survey = require('../models/survey');

const getResponsesBySurveyId = async (req, res) => {
    try {
        const { id } = req.params;

        const survey = await Survey.findById(id);
        if (!survey) {
            return res
                .status(404)
                .json({ message: 'Survey not found' });
        }

        const responses = await Response.findById({ surveyID: id });
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

        // basic validation for token and answers
        if (!token) {
            return res
                .status(400)
                .json({ message: 'Survey token is required' });
        }
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res
                .status(400)
                .json({ message: 'Answers are required and should be a non-empty array' });
        }

        // find survey by token
        const survey = await Survey.findOne({ token });
        if (!survey) {
            return res
                .status(404)
                .json({ message: 'Survey not found' });
        }

        // validate submitted answers against survey questions
        if (answers.length !== survey.questions.length) {
            return res
                .status(400)
                .json({ message: 'Number of answers does not match number of questions in the survey' });
        }

        // perform any additional validation on answers if needed
        const validatedAnswers = [];
        for (const submittedAnswer of answers) {
            // find corresponding question
            const question = survey.questions.id(submittedAnswer.questionId);
            if (!question) {
                return res
                    .status(400)
                    .json({ message: `Invalid question ID: ${submittedAnswer.questionId}` });
            }

            // validate answer based on question type and specifications
            let isValid = true;
            switch (question.type) {
                case 'TEXTBOX':
                    // For TEXTBOX, check maxLength if specified
                    if (question.spec && question.spec.maxLength && submittedAnswer.value.length > question.spec.maxLength) {
                        if (typeof answer !== 'string' || answer.length > question.spec.maxLength) {
                            isValid = false;
                            res
                                .status(400)
                                .json({ message: `Answer for question ${question.id} exceeds maximum length of ${question.spec.maxLength}` });
                        }
                        break;
                    }
                case 'MULTIPLE_CHOICE':
                    // For MULTIPLE_CHOICE, check if the answer is one of the options
                    if (question.spec && !question.spec.choices.includes(submittedAnswer.value)) {
                        isValid = false;
                        res
                            .status(400)
                            .json({ message: `Answer for question ${question.id} is not a valid choice` });
                    }
                    break;
                case 'LIKERT':
                    // For LIKERT, check if the answer is within the min-max range
                    const value = Number(submittedAnswer.value);
                    if (isNaN(value) || question.spec && (submittedAnswer.value < question.spec.min || submittedAnswer.value > question.spec.max)) {
                        isValid = false;
                        res
                            .status(400)
                            .json({ message: `Answer for question ${question.id} is out of range` });
                    }

            }
            if (!isValid) {
                return res
                    .status(400)
                    .json({ message: `Invalid answer for question ID: ${submittedAnswer.questionId}` });
            }

            // if valid, add to validated answers
            validatedAnswers.push({
                questionId: submittedAnswer.questionId,
                value: submittedAnswer.value
            });
        }

        // create and save the response
        const newResponse = await Response.create({
            surveyID: survey._id,
            answers: validatedAnswers
        });

        // success response
        res
            .status(201)
            .json({ message: 'Response submitted successfully', response: newResponse } );
    }

    catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    getResponsesBySurveyId,
    submitResponse
};