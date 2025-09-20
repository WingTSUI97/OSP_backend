const mongoose = require('mongoose');

const specificSchema = mongoose.Schema(
    {
        // Optional optional constraints
        maxLength: Number,

        // array of strings for MULTIPLE_CHOICE type
        choices: [String],

        // For LIKERT type
        min: Number,
        max: Number,
        labels: [String]  // e.g., ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']       
    },
    {
        _id: false
    }
);

const questionSchema = mongoose.Schema(
    {
        text: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['TEXTBOX', 'MULTIPLE_CHOICE-choice', 'LIKERT'],             
            required: true
        },
        sepc: specificSchema    
    },
    {
        _id: false
    }

);

const surveySchema = mongoose.Schema(
    {
        title: {
            type: string,
            required: true
        },
        token: {
            type: string,
            required: true

        },
        questions: [questionSchema] // Array of questionSchema objects, at least one question required
    },
    {
        timestamps: true
    }
);

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
// End of survey.js file