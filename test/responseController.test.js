// OSP_backend/test/responseController.test.js

// Mock the database connection
jest.mock('../src/config/dbConnect', () => ({
    dbConnect: jest.fn(() => console.log('Mock DB connection'))
}));

// Mock the other modules
jest.mock('../src/models/response');
jest.mock('../src/models/survey');

// Import the required files
const { getResponsesBySurveyId, submitResponse } = require('../src/controllers/responseController');
const Response = require('../src/models/response');
const Survey = require('../src/models/survey');

describe('Response Controller Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getResponsesBySurveyId', () => {
        it('should get responses for a survey successfully', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'mock_survey_id' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const mockSurvey = {
                _id: 'mock_survey_id',
                title: 'Test Survey'
            };
            
            const mockResponses = [
                {
                    _id: 'response_1',
                    surveyId: 'mock_survey_id',
                    answers: []
                },
                {
                    _id: 'response_2',
                    surveyId: 'mock_survey_id',
                    answers: []
                }
            ];
            
            Survey.findById.mockResolvedValue(mockSurvey);
            Response.find.mockResolvedValue(mockResponses);

            // Act
            await getResponsesBySurveyId(mockReq, mockRes);

            // Assert
            expect(Survey.findById).toHaveBeenCalledWith('mock_survey_id');
            expect(Response.find).toHaveBeenCalledWith({ surveyId: 'mock_survey_id' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Responses fetched successfully',
                responses: mockResponses
            });
        });

        it('should return 404 when survey not found', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'mock_survey_id' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findById.mockResolvedValue(null);

            // Act
            await getResponsesBySurveyId(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey not found'
            });
            expect(Response.find).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid survey ID format', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'invalid_id' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const castError = new Error('Cast to ObjectId failed');
            castError.name = 'CastError';
            Survey.findById.mockRejectedValue(castError);

            // Act
            await getResponsesBySurveyId(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid survey ID format'
            });
        });

        it('should return 500 on server error', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'mock_survey_id' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findById.mockRejectedValue(new Error('Server error'));

            // Act
            await getResponsesBySurveyId(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Server error'
            });
        });
    });

    describe('submitResponse', () => {
        let mockSurvey;
        let mockQuestions;

        beforeEach(() => {
            mockQuestions = [
                {
                    _id: 'question_1',
                    id: 'question_1',
                    text: 'What is your name?',
                    type: 'TEXTBOX',
                    spec: { maxLength: 50 }
                },
                {
                    _id: 'question_2',
                    id: 'question_2',
                    text: 'Rate your experience',
                    type: 'LIKERT',
                    spec: { min: 1, max: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] }
                },
                {
                    _id: 'question_3',
                    id: 'question_3',
                    text: 'Choose your favorite color',
                    type: 'MULTIPLE_CHOICE',
                    spec: { choices: ['Red', 'Blue', 'Green', 'Yellow'] }
                }
            ];

            // Create a mock questions array with an id method
            const mockQuestionsWithId = mockQuestions.map(q => ({ ...q }));
            mockQuestionsWithId.id = jest.fn().mockImplementation((id) => {
                const question = mockQuestions.find(q => q._id === id);
                return question || null;
            });

            mockSurvey = {
                _id: 'mock_survey_id',
                title: 'Test Survey',
                token: 'abcde',
                questions: mockQuestionsWithId
            };
        });

        it('should submit response successfully', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'question_1', value: 'John Doe' },
                        { questionId: 'question_2', value: '4' },
                        { questionId: 'question_3', value: 'Blue' }
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const mockCreatedResponse = {
                _id: 'response_id',
                surveyId: 'mock_survey_id',
                answers: mockReq.body.answers
            };
            
            Survey.findOne.mockResolvedValue(mockSurvey);
            Response.create.mockResolvedValue(mockCreatedResponse);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(Survey.findOne).toHaveBeenCalledWith({ token: 'abcde' });
            expect(Response.create).toHaveBeenCalledWith({
                surveyId: 'mock_survey_id',
                answers: mockReq.body.answers
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Response submitted successfully',
                response: mockCreatedResponse
            });
        });

        it('should return 400 for missing token', async () => {
            // Arrange
            const mockReq = {
                params: {},
                body: {
                    answers: [{ questionId: 'question_1', value: 'John Doe' }]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey token is required'
            });
            expect(Survey.findOne).not.toHaveBeenCalled();
        });

        it('should return 400 for missing answers', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {}
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Answers are required and should be a non-empty array'
            });
            expect(Survey.findOne).not.toHaveBeenCalled();
        });

        it('should return 400 for empty answers array', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: { answers: [] }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Answers are required and should be a non-empty array'
            });
            expect(Survey.findOne).not.toHaveBeenCalled();
        });

        it('should return 404 when survey not found', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'invalid_token' },
                body: {
                    answers: [{ questionId: 'question_1', value: 'John Doe' }]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(null);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey not found'
            });
            expect(Response.create).not.toHaveBeenCalled();
        });

        it('should return 400 for wrong number of answers', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'question_1', value: 'John Doe' }
                        // Missing other answers
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(mockSurvey);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Number of answers does not match number of questions in the survey'
            });
            expect(Response.create).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid question ID', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'invalid_question_id', value: 'John Doe' },
                        { questionId: 'question_2', value: '4' },
                        { questionId: 'question_3', value: 'Blue' }
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(mockSurvey);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid question ID: invalid_question_id'
            });
            expect(Response.create).not.toHaveBeenCalled();
        });

        it('should return 400 for TEXTBOX answer exceeding maxLength', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { 
                            questionId: 'question_1', 
                            value: 'This is a very long answer that exceeds the maximum length of 50 characters specified in the question spec'
                        },
                        { questionId: 'question_2', value: '4' },
                        { questionId: 'question_3', value: 'Blue' }
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(mockSurvey);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Answer for question question_1 exceeds maximum length of 50'
            });
            expect(Response.create).not.toHaveBeenCalled();
        });

        it('should return 400 for MULTIPLE_CHOICE invalid choice', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'question_1', value: 'John Doe' },
                        { questionId: 'question_2', value: '4' },
                        { questionId: 'question_3', value: 'Purple' } // Invalid choice
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(mockSurvey);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Answer for question question_3 is not a valid choice'
            });
            expect(Response.create).not.toHaveBeenCalled();
        });

        it('should return 400 for LIKERT out of range', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'question_1', value: 'John Doe' },
                        { questionId: 'question_2', value: '10' }, // Out of range (1-5)
                        { questionId: 'question_3', value: 'Blue' }
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(mockSurvey);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Answer for question question_2 is out of range'
            });
            expect(Response.create).not.toHaveBeenCalled();
        });

        it('should return 400 for LIKERT non-numeric value', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'question_1', value: 'John Doe' },
                        { questionId: 'question_2', value: 'not_a_number' },
                        { questionId: 'question_3', value: 'Blue' }
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(mockSurvey);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Answer for question question_2 is out of range'
            });
            expect(Response.create).not.toHaveBeenCalled();
        });

        it('should return 400 for unsupported question type', async () => {
            // Arrange
            const unsupportedQuestions = [
                {
                    _id: 'question_1',
                    id: 'question_1',
                    text: 'Unsupported question',
                    type: 'UNSUPPORTED_TYPE',
                    spec: {}
                }
            ];
            unsupportedQuestions.id = jest.fn().mockImplementation((id) => {
                return unsupportedQuestions.find(q => q._id === id) || null;
            });

            const mockSurveyWithUnsupportedType = {
                ...mockSurvey,
                questions: unsupportedQuestions
            };

            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'question_1', value: 'some answer' }
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(mockSurveyWithUnsupportedType);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Unsupported question type: UNSUPPORTED_TYPE'
            });
            expect(Response.create).not.toHaveBeenCalled();
        });

        it('should return 500 on server error', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'question_1', value: 'John Doe' }
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockRejectedValue(new Error('Server error'));

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Server error'
            });
        });

        it('should handle TEXTBOX without maxLength constraint', async () => {
            // Arrange
            const questionsWithoutMaxLength = [
                {
                    _id: 'question_1',
                    id: 'question_1',
                    text: 'What is your name?',
                    type: 'TEXTBOX',
                    spec: {} // No maxLength constraint
                }
            ];
            questionsWithoutMaxLength.id = jest.fn().mockImplementation((id) => {
                return questionsWithoutMaxLength.find(q => q._id === id) || null;
            });

            const mockSurveyWithoutMaxLength = {
                ...mockSurvey,
                questions: questionsWithoutMaxLength
            };

            const mockReq = {
                params: { token: 'abcde' },
                body: {
                    answers: [
                        { questionId: 'question_1', value: 'John Doe' }
                    ]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const mockCreatedResponse = {
                _id: 'response_id',
                surveyId: 'mock_survey_id',
                answers: mockReq.body.answers
            };
            
            Survey.findOne.mockResolvedValue(mockSurveyWithoutMaxLength);
            Response.create.mockResolvedValue(mockCreatedResponse);

            // Act
            await submitResponse(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Response submitted successfully',
                response: mockCreatedResponse
            });
        });
    });
});
