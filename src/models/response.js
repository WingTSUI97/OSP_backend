const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        // The actual value of the answer (e.g., text, multiple-choice option).
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    {
        _id: false
    }
);

const responseSchema = new mongoose.Schema(
    {
        surveyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Survey', // Reference to the Survey model
            required: true
        },
        answers: [answerSchema] // Array of answerSchema objects
    },
    {
        timestamps: true
    }
);


const Response = mongoose.model('Response', responseSchema);

module.exports = Response;