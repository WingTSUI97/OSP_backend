// Mock the database connection
jest.mock('../src/config/dbConnect', () => ({
    dbConnect: jest.fn(() => console.log('Mock DB connection'))
}));

// Mock the other modules
jest.mock('../src/models/survey');
jest.mock('../src/utils/tokenGenerator');

// Import the required files
const { createSurvey, updateSurvey, deleteSurvey, getSurveyByToken } = require('../src/controllers/surveyController');
const Survey = require('../src/models/survey');
const generateToken = require('../src/utils/tokenGenerator');

describe('Survey Controller Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createSurvey', () => {
        it('should create a survey successfully', async () => {
            // Arrange
            const mockReq = {
                body: {
                    title: 'Test Survey',
                    questions: [{
                        text: 'Test Question',
                        type: 'TEXTBOX',
                        spec: { maxLength: 50 }
                    }]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const mockSurveyInstance = {
                _id: 'mock_survey_id',
                title: mockReq.body.title,
                token: 'abcde',
                questions: mockReq.body.questions,
                save: jest.fn().mockResolvedValue({
                    _id: 'mock_survey_id',
                    title: mockReq.body.title,
                    token: 'abcde',
                    questions: mockReq.body.questions
                })
            };
            
            Survey.mockImplementation(() => mockSurveyInstance);
            generateToken.mockResolvedValue('abcde');

            // Act
            await createSurvey(mockReq, mockRes);

            // Assert
            expect(Survey).toHaveBeenCalledTimes(1);
            expect(Survey).toHaveBeenCalledWith({
                title: 'Test Survey',
                token: 'abcde',
                questions: mockReq.body.questions
            });
            expect(mockSurveyInstance.save).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey created successfully',
                survey: mockSurveyInstance
            });
        });

        it('should return 400 for missing title', async () => {
            // Arrange
            const mockReq = {
                body: {
                    questions: [{
                        text: 'Test Question',
                        type: 'TEXTBOX',
                        spec: { maxLength: 50 }
                    }]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };

            // Act
            await createSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Title and at least one question are required'
            });
            expect(Survey).not.toHaveBeenCalled();
        });

        it('should return 400 for missing questions', async () => {
            // Arrange
            const mockReq = {
                body: {
                    title: 'Test Survey'
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };

            // Act
            await createSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Title and at least one question are required'
            });
            expect(Survey).not.toHaveBeenCalled();
        });

        it('should return 400 for empty questions array', async () => {
            // Arrange
            const mockReq = {
                body: {
                    title: 'Test Survey',
                    questions: []
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };

            // Act
            await createSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Title and at least one question are required'
            });
            expect(Survey).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid question structure', async () => {
            // Arrange
            const mockReq = {
                body: {
                    title: 'Test Survey',
                    questions: [{
                        text: 'Test Question',
                        type: 'TEXTBOX'
                        // Missing spec
                    }]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };

            // Act
            await createSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Each question must have text, type, and spec fields.'
            });
            expect(Survey).not.toHaveBeenCalled();
        });

        it('should return 500 on database error', async () => {
            // Arrange
            const mockReq = {
                body: {
                    title: 'Test Survey',
                    questions: [{
                        text: 'Test Question',
                        type: 'TEXTBOX',
                        spec: { maxLength: 50 }
                    }]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const mockSurveyInstance = {
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            
            Survey.mockImplementation(() => mockSurveyInstance);
            generateToken.mockResolvedValue('abcde');

            // Act
            await createSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Server error'
            });
        });
    });

    describe('updateSurvey', () => {
        it('should update a survey successfully', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'mock_survey_id' },
                body: {
                    title: 'Updated Survey',
                    questions: [{
                        text: 'Updated Question',
                        type: 'TEXTBOX',
                        spec: { maxLength: 100 }
                    }]
                }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const mockUpdatedSurvey = {
                _id: 'mock_survey_id',
                title: 'Updated Survey',
                questions: mockReq.body.questions
            };
            
            Survey.findByIdAndUpdate.mockResolvedValue(mockUpdatedSurvey);

            // Act
            await updateSurvey(mockReq, mockRes);

            // Assert
            expect(Survey.findByIdAndUpdate).toHaveBeenCalledWith(
                'mock_survey_id',
                { title: 'Updated Survey', questions: mockReq.body.questions },
                { new: true, runValidators: true }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey updated successfully',
                survey: mockUpdatedSurvey
            });
        });

        it('should return 400 when no update data provided', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'mock_survey_id' },
                body: {}
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };

            // Act
            await updateSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'At least one of title or questions must be provided for update'
            });
            expect(Survey.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('should return 404 when survey not found', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'mock_survey_id' },
                body: { title: 'Updated Survey' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findByIdAndUpdate.mockResolvedValue(null);

            // Act
            await updateSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey not found'
            });
        });

        it('should return 400 for invalid survey ID format', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'invalid_id' },
                body: { title: 'Updated Survey' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const castError = new Error('Cast to ObjectId failed');
            castError.name = 'CastError';
            Survey.findByIdAndUpdate.mockRejectedValue(castError);

            // Act
            await updateSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid survey ID format'
            });
        });

        it('should return 500 on server error', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'mock_survey_id' },
                body: { title: 'Updated Survey' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findByIdAndUpdate.mockRejectedValue(new Error('Server error'));

            // Act
            await updateSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Server error'
            });
        });
    });

    describe('deleteSurvey', () => {
        it('should delete a survey successfully', async () => {
            // Arrange
            const mockReq = {
                params: { id: 'mock_survey_id' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const mockDeletedSurvey = {
                _id: 'mock_survey_id',
                title: 'Deleted Survey'
            };
            
            Survey.findByIdAndDelete.mockResolvedValue(mockDeletedSurvey);

            // Act
            await deleteSurvey(mockReq, mockRes);

            // Assert
            expect(Survey.findByIdAndDelete).toHaveBeenCalledWith('mock_survey_id');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey deleted successfully',
                survey: mockDeletedSurvey
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
            
            Survey.findByIdAndDelete.mockResolvedValue(null);

            // Act
            await deleteSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey not found'
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
            
            Survey.findByIdAndDelete.mockRejectedValue(new Error('Server error'));

            // Act
            await deleteSurvey(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Server error'
            });
        });
    });

    describe('getSurveyByToken', () => {
        it('should get survey by token successfully', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            const mockSurvey = {
                _id: 'mock_survey_id',
                title: 'Test Survey',
                token: 'abcde',
                questions: []
            };
            
            Survey.findOne.mockResolvedValue(mockSurvey);

            // Act
            await getSurveyByToken(mockReq, mockRes);

            // Assert
            expect(Survey.findOne).toHaveBeenCalledWith({ token: 'abcde' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                survey: mockSurvey
            });
        });

        it('should return 404 when survey not found', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'invalid_token' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockResolvedValue(null);

            // Act
            await getSurveyByToken(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Survey not found'
            });
        });

        it('should return 500 on server error', async () => {
            // Arrange
            const mockReq = {
                params: { token: 'abcde' }
            };
            const mockRes = {
                status: jest.fn(() => mockRes),
                json: jest.fn()
            };
            
            Survey.findOne.mockRejectedValue(new Error('Server error'));

            // Act
            await getSurveyByToken(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Server error'
            });
        });
    });
});