const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const { dbConnect } = require('../src/config/dbConnect');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await dbConnect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Integration Test: POST /api/admin/surveys', () => {
    it('Should create a new survey and save to db', async () => {
        const res = await request(app)
            .post('/api/admin/surveys')
            .set('x-api-key', process.env.ADMIN_API_KEY)
            .send(
                {
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
                }
            );

        expect(res.statusCode).toEqual(201);
        expect(res.body.survey).toHaveProperty('title', 'Developer Feedback Survey');
        // console.log(res.body._survey)
    });

})