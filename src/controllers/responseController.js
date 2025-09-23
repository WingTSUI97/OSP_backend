const Response = require('../models/response');
const Survey = require('../models/survey');

const getResponsesBySurveyId = async (req, res) => {
    try{
        const { id } = req.params;
        const responses = await Response.findById(id);
        if (!responses) {
            return res.status(404).json({ message: 'Responses not found' });
        }
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const submitResponse = async (req, res) => {

};


module.exports = {
    getResponsesBySurveyId,
    submitResponse
};