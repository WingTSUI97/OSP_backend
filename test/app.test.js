const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const dbConnect = require('../src/config/dbConnect');

let mongoServer;
let createdSurveyId;
let createdSurveyToken;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await dbConnect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Integration Tests - Admin Routes', () => {
    describe('POST /api/admin/surveys', () => {
        it('Should create a new survey successfully', async () => {
            const surveyData = {
                "title": "Developer Feedback Survey",
                "questions": [
                    {
                        "text": "What is your main programming language?",
                        "type": "TEXTBOX",
                        "spec": {
                            "maxLength": 100
                        }
                    },
                    {
                        "text": "How do you rate the difficulty of this assessment?",
                        "type": "LIKERT",
                        "spec": {
                            "min": 1,
                            "max": 5,
                            "labels": ["Very Easy", "Easy", "Neutral", "Hard", "Very Hard"]
                        }
                    },
                    {
                        "text": "Which framework do you prefer for Node.js?",
                        "type": "MULTIPLE_CHOICE",
                        "spec": {
                            "choices": ["Express", "NestJS", "Koa", "Sails.js"]
                        }
                    }
                ]
            };

            const res = await request(app)
                .post('/api/admin/surveys')
                .set('x-api-key', process.env.ADMIN_API_KEY)
                .send(surveyData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toBe('Survey created successfully');
            expect(res.body.survey).toHaveProperty('title', 'Developer Feedback Survey');
            expect(res.body.survey).toHaveProperty('token');
            expect(res.body.survey).toHaveProperty('questions');
            expect(res.body.survey.questions).toHaveLength(3);

            // Store for other tests
            createdSurveyId = res.body.survey._id;
            createdSurveyToken = res.body.survey.token;
        });

        it('Should return 400 for missing title', async () => {
            const res = await request(app)
                .post('/api/admin/surveys')
                .set('x-api-key', process.env.ADMIN_API_KEY)
                .send({
                    "questions": [
                        {
                            "text": "Test question",
                            "type": "TEXTBOX",
                            "spec": { "maxLength": 100 }
                        }
                    ]
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Title and at least one question are required');
        });

        it('Should return 400 for empty questions array', async () => {
            const res = await request(app)
                .post('/api/admin/surveys')
                .set('x-api-key', process.env.ADMIN_API_KEY)
                .send({
                    "title": "Test Survey",
                    "questions": []
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Title and at least one question are required');
        });

        it('Should return 401 for missing API key', async () => {
            const res = await request(app)
                .post('/api/admin/surveys')
                .send({
                    "title": "Test Survey",
                    "questions": [
                        {
                            "text": "Test question",
                            "type": "TEXTBOX",
                            "spec": { "maxLength": 100 }
                        }
                    ]
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Unauthorized: Invalid or missing API Key');
        });

        it('Should return 401 for invalid API key', async () => {
            const res = await request(app)
                .post('/api/admin/surveys')
                .set('x-api-key', 'invalid-key')
                .send({
                    "title": "Test Survey",
                    "questions": [
                        {
                            "text": "Test question",
                            "type": "TEXTBOX",
                            "spec": { "maxLength": 100 }
                        }
                    ]
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Unauthorized: Invalid or missing API Key');
        });
    });

    describe('PUT /api/admin/surveys/:id', () => {
        it('Should update a survey successfully', async () => {
            const updateData = {
                "title": "Updated Developer Feedback Survey",
                "questions": [
                    {
                        "text": "What is your favorite programming language?",
                        "type": "TEXTBOX",
                        "spec": {
                            "maxLength": 50
                        }
                    }
                ]
            };

            const res = await request(app)
                .put(`/api/admin/surveys/${createdSurveyId}`)
                .set('x-api-key', process.env.ADMIN_API_KEY)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Survey updated successfully');
            expect(res.body.survey.title).toBe('Updated Developer Feedback Survey');
            expect(res.body.survey.questions).toHaveLength(1);
        });

        it('Should return 404 for non-existent survey', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/admin/surveys/${fakeId}`)
                .set('x-api-key', process.env.ADMIN_API_KEY)
                .send({
                    "title": "Updated Survey"
                });

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('Survey not found');
        });

        it('Should return 400 for invalid survey ID format', async () => {
            const res = await request(app)
                .put('/api/admin/surveys/invalid-id')
                .set('x-api-key', process.env.ADMIN_API_KEY)
                .send({
                    "title": "Updated Survey"
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Invalid survey ID format');
        });
    });

    describe('DELETE /api/admin/surveys/:id', () => {
        it('Should delete a survey successfully', async () => {
            const res = await request(app)
                .delete(`/api/admin/surveys/${createdSurveyId}`)
                .set('x-api-key', process.env.ADMIN_API_KEY);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Survey deleted successfully');
            expect(res.body.survey).toHaveProperty('_id', createdSurveyId);
        });

        it('Should return 404 for non-existent survey', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/admin/surveys/${fakeId}`)
                .set('x-api-key', process.env.ADMIN_API_KEY);

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('Survey not found');
        });
    });

    describe('GET /api/admin/surveys/:id/responses', () => {
        let testSurveyId;

        beforeAll(async () => {
            // Create a test survey for response testing
            const surveyData = {
                "title": "Test Survey for Responses",
                "questions": [
                    {
                        "text": "Test question",
                        "type": "TEXTBOX",
                        "spec": { "maxLength": 100 }
                    }
                ]
            };

            const res = await request(app)
                .post('/api/admin/surveys')
                .set('x-api-key', process.env.ADMIN_API_KEY)
                .send(surveyData);

            testSurveyId = res.body.survey._id;
        });

        it('Should get responses for a survey (empty initially)', async () => {
            const res = await request(app)
                .get(`/api/admin/surveys/${testSurveyId}/responses`)
                .set('x-api-key', process.env.ADMIN_API_KEY);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Responses fetched successfully');
            expect(res.body.responses).toEqual([]);
        });

        it('Should return 404 for non-existent survey', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/admin/surveys/${fakeId}/responses`)
                .set('x-api-key', process.env.ADMIN_API_KEY);

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('Survey not found');
        });
    });
});

describe('Integration Tests - Participant Routes', () => {
    let testSurveyToken;

    beforeAll(async () => {
        // Create a test survey for participant testing
        const surveyData = {
            "title": "Participant Test Survey",
            "questions": [
                {
                    "text": "What is your name?",
                    "type": "TEXTBOX",
                    "spec": { "maxLength": 50 }
                },
                {
                    "text": "Rate your experience",
                    "type": "LIKERT",
                    "spec": {
                        "min": 1,
                        "max": 5,
                        "labels": ["Poor", "Fair", "Good", "Very Good", "Excellent"]
                    }
                },
                {
                    "text": "Choose your favorite color",
                    "type": "MULTIPLE_CHOICE",
                    "spec": {
                        "choices": ["Red", "Blue", "Green", "Yellow"]
                    }
                }
            ]
        };

        const res = await request(app)
            .post('/api/admin/surveys')
            .set('x-api-key', process.env.ADMIN_API_KEY)
            .send(surveyData);

        testSurveyToken = res.body.survey.token;
    });

    describe('GET /api/surveys/:token', () => {
        it('Should get survey by token successfully', async () => {
            const res = await request(app)
                .get(`/api/surveys/${testSurveyToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.survey).toHaveProperty('title', 'Participant Test Survey');
            expect(res.body.survey).toHaveProperty('token', testSurveyToken);
            expect(res.body.survey).toHaveProperty('questions');
            expect(res.body.survey.questions).toHaveLength(3);
        });

        it('Should return 404 for invalid token', async () => {
            const res = await request(app)
                .get('/api/surveys/invalid-token');

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('Survey not found');
        });
    });

    describe('POST /api/surveys/:token/responses', () => {
        it('Should submit response successfully', async () => {
            // First get the survey to get question IDs
            const surveyRes = await request(app)
                .get(`/api/surveys/${testSurveyToken}`);

            const questions = surveyRes.body.survey.questions;
            const answers = [
                {
                    "questionId": questions[0]._id,
                    "value": "John Doe"
                },
                {
                    "questionId": questions[1]._id,
                    "value": "4"
                },
                {
                    "questionId": questions[2]._id,
                    "value": "Blue"
                }
            ];

            const res = await request(app)
                .post(`/api/surveys/${testSurveyToken}/responses`)
                .send({ answers });

            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toBe('Response submitted successfully');
            expect(res.body.response).toHaveProperty('surveyId');
            expect(res.body.response).toHaveProperty('answers');
            expect(res.body.response.answers).toHaveLength(3);
        });

        it('Should return 400 for missing answers', async () => {
            const res = await request(app)
                .post(`/api/surveys/${testSurveyToken}/responses`)
                .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Answers are required and should be a non-empty array');
        });

        it('Should return 400 for wrong number of answers', async () => {
            const surveyRes = await request(app)
                .get(`/api/surveys/${testSurveyToken}`);

            const questions = surveyRes.body.survey.questions;
            const answers = [
                {
                    "questionId": questions[0]._id,
                    "value": "John Doe"
                }
                // Missing other answers
            ];

            const res = await request(app)
                .post(`/api/surveys/${testSurveyToken}/responses`)
                .send({ answers });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Number of answers does not match number of questions in the survey');
        });

        it('Should return 400 for invalid question ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const answers = [
                {
                    "questionId": fakeId,
                    "value": "John Doe"
                }
            ];

            const res = await request(app)
                .post(`/api/surveys/${testSurveyToken}/responses`)
                .send({ answers });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Invalid question ID');
        });

        it('Should return 400 for TEXTBOX answer exceeding maxLength', async () => {
            const surveyRes = await request(app)
                .get(`/api/surveys/${testSurveyToken}`);

            const questions = surveyRes.body.survey.questions;
            const answers = [
                {
                    "questionId": questions[0]._id,
                    "value": "This is a very long answer that exceeds the maximum length of 50 characters specified in the question spec"
                },
                {
                    "questionId": questions[1]._id,
                    "value": "4"
                },
                {
                    "questionId": questions[2]._id,
                    "value": "Blue"
                }
            ];

            const res = await request(app)
                .post(`/api/surveys/${testSurveyToken}/responses`)
                .send({ answers });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('exceeds maximum length');
        });

        it('Should return 400 for MULTIPLE_CHOICE invalid choice', async () => {
            const surveyRes = await request(app)
                .get(`/api/surveys/${testSurveyToken}`);

            const questions = surveyRes.body.survey.questions;
            const answers = [
                {
                    "questionId": questions[0]._id,
                    "value": "John Doe"
                },
                {
                    "questionId": questions[1]._id,
                    "value": "4"
                },
                {
                    "questionId": questions[2]._id,
                    "value": "Purple" // Invalid choice
                }
            ];

            const res = await request(app)
                .post(`/api/surveys/${testSurveyToken}/responses`)
                .send({ answers });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('is not a valid choice');
        });

        it('Should return 400 for LIKERT out of range', async () => {
            const surveyRes = await request(app)
                .get(`/api/surveys/${testSurveyToken}`);

            const questions = surveyRes.body.survey.questions;
            const answers = [
                {
                    "questionId": questions[0]._id,
                    "value": "John Doe"
                },
                {
                    "questionId": questions[1]._id,
                    "value": "10" // Out of range (1-5)
                },
                {
                    "questionId": questions[2]._id,
                    "value": "Blue"
                }
            ];

            const res = await request(app)
                .post(`/api/surveys/${testSurveyToken}/responses`)
                .send({ answers });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('is out of range');
        });

        it('Should return 404 for invalid token', async () => {
            const answers = [
                {
                    "questionId": new mongoose.Types.ObjectId(),
                    "value": "John Doe"
                }
            ];

            const res = await request(app)
                .post('/api/surveys/invalid-token/responses')
                .send({ answers });

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe('Survey not found');
        });
    });
});