// OSP_backend/test/surveyController.test.js

// 1. Mock the database connection
jest.mock('../src/config/dbConnect', () => ({
    connectDB: jest.fn(() => console.log('Mock DB connection'))
}));

// 2. Mock the other modules
jest.mock('../src/models/survey');
jest.mock('../src/utils/tokenGenerator', () => ({
    generateToken: jest.fn(),
}));

// 3. Import the required files
const { createSurvey } = require('../src/controllers/surveyController');
const Survey = require('../src/models/survey');
const { generateToken } = require('../src/utils/tokenGenerator');

describe('Survey Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

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
            _id: 'some_mock_id',
            title: mockReq.body.title,
            token: 'abcde',
            questions: mockReq.body.questions,
            save: jest.fn().mockResolvedValue(true)
        };
        
        Survey.mockImplementation(() => mockSurveyInstance);
        generateToken.mockResolvedValue('abcde');

        // Act
        await createSurvey(mockReq, mockRes);

        // Assert
        expect(Survey).toHaveBeenCalledTimes(1);
        expect(mockSurveyInstance.save).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Survey created successfully',
            survey: expect.objectContaining({
                title: 'Test Survey',
                token: 'abcde'
            })
        });
    });
});

//################ Version 5 - s #################
// // Mock the database connection to prevent it from running during tests
// jest.mock('../src/config/dbConnect', () => ({
//     connectDB: jest.fn(() => console.log('Mock DB connection'))
// }));

// // Rest of your mocks and code...
// jest.mock('../src/models/survey');
// jest.mock('../src/utils/tokenGenerator', () => {
//     return {
//         generateToken: jest.fn(),
//     };
// });
// // Then, import the modules you need
// const { createSurvey } = require('../src/controllers/surveyController');
// const Survey = require('../src/models/survey'); // This is now a mock function
// const { generateToken } = require('../src/utils/tokenGenerator'); // This is now the mock function from above

// describe('Survey Controller', () => {
//   beforeEach(() => {
//     // Clear all mocks before each test
//     jest.clearAllMocks();
//   });

//   it('should create a survey successfully', async () => {
//     // Arrange
//     const mockReq = {
//       body: {
//         title: 'Test Survey',
//         questions: [{
//           text: 'Test Question',
//           type: 'TEXTBOX',
//           spec: { maxLength: 50 }
//         }]
//       }
//     };
//     const mockRes = {
//       status: jest.fn(() => mockRes),
//       json: jest.fn()
//     };
    
//     // Define a mock instance with a working save method
//     const mockSurveyInstance = {
//       _id: 'some_mock_id',
//       title: mockReq.body.title,
//       token: 'abcde',
//       questions: mockReq.body.questions,
//       save: jest.fn().mockResolvedValue(true)
//     };

//     // Tell the mock Survey class (the constructor) what to return when it's instantiated
//     Survey.mockImplementation(() => mockSurveyInstance);

//     // Tell the mock token generator what to return
//     generateToken.mockResolvedValue('abcde');

//     // Act
//     await createSurvey(mockReq, mockRes);

//     // Assert
//     expect(Survey).toHaveBeenCalledTimes(1);
//     expect(mockSurveyInstance.save).toHaveBeenCalledTimes(1);
//     expect(mockRes.status).toHaveBeenCalledWith(201);
//     expect(mockRes.json).toHaveBeenCalledWith({
//       message: 'Survey created successfully',
//       survey: expect.objectContaining({
//         title: 'Test Survey',
//         token: 'abcde'
//       })
//     });
//   });
// });
//################ Version 5 - e #################

//################ Version 4 - s #################
// // Place all jest.mock() calls at the very top of the file
// jest.mock('../src/models/survey');
// jest.mock('../src/utils/tokenGenerator', () => {
//   // This factory function explicitly defines the mock for the module.
//   return {
//     generateToken: jest.fn(),
//   };
// });

// // Then, import the modules you need
// const { createSurvey } = require('../src/controllers/surveyController');
// const Survey = require('../src/models/survey'); // This is now a mock function
// const {generateToken} = require('../src/utils/tokenGenerator');

// describe('Survey Controller', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     it('should create a survey successfully', async () => {
//         // Arrange
//         const mockReq = {
//             body: {
//                 title: 'Test Survey',
//                 questions: [{
//                     text: 'Test Question',
//                     type: 'TEXTBOX',
//                     spec: { maxLength: 50 }
//                 }]
//             }
//         };
//         const mockRes = {
//             status: jest.fn(() => mockRes),
//             json: jest.fn()
//         };
        
//         // Mock the token generator to return a predictable value
//         generateToken.mockResolvedValue('abcde');

//         // Mock the Mongoose model instance and its save method
//         const mockSurveyInstance = {
//             _id: 'some_mock_id',
//             title: mockReq.body.title,
//             token: 'abcde',
//             questions: mockReq.body.questions,
//             save: jest.fn().mockResolvedValue(true)
//         };
        
//         // This is the key line. We are telling the mock Survey constructor what to return when it's called with 'new'.
//         Survey.mockImplementation(() => mockSurveyInstance);

//         // Act
//         await createSurvey(mockReq, mockRes);

//         // Assert
//         expect(Survey).toHaveBeenCalledTimes(1);
//         expect(mockSurveyInstance.save).toHaveBeenCalledTimes(1);
//         expect(mockRes.status).toHaveBeenCalledWith(201);
//         expect(mockRes.json).toHaveBeenCalledWith({
//             message: 'Survey created successfully',
//             survey: expect.objectContaining({
//                 title: 'Test Survey',
//                 token: 'abcde'
//             })
//         });
//     });
// });
//################ Version 4 - e #################


//################ Version 3 - s #################
// // Place all jest.mock() calls at the very top of the file
// jest.mock('../src/models/survey');
// jest.mock('../src/utils/tokenGenerator');

// // Then, import the modules you need
// const { createSurvey } = require('../src/controllers/surveyController');
// const Survey = require('../src/models/survey'); // This will now be a mock function
// const { generateToken } = require('../src/utils/tokenGenerator');

// describe('Survey Controller', () => {
//     beforeEach(() => {
//         // Clear all mocks before each test
//         jest.clearAllMocks();
//     });

//     it('should create a survey successfully', async () => {
//         // Arrange
//         const mockReq = {
//             body: {
//                 title: 'Test Survey',
//                 questions: [{
//                     text: 'Test Question',
//                     type: 'TEXTBOX',
//                     spec: { maxLength: 50 }
//                 }]
//             }
//         };
//         const mockRes = {
//             status: jest.fn(() => mockRes),
//             json: jest.fn()
//         };
        
//         // Define a mock instance with a working save method
//         const mockSurveyInstance = {
//             save: jest.fn().mockResolvedValue(true),
//             ...mockReq.body
//         };

//         // Tell the mock Survey class (the constructor) what to return when it's instantiated
//         Survey.mockImplementation(() => mockSurveyInstance);

//         // Tell the mock token generator what to return
//         generateToken.mockResolvedValue('abcde');

//         // Act
//         await createSurvey(mockReq, mockRes);

//         // Assert
//         expect(Survey).toHaveBeenCalledTimes(1); // Check that the Survey model was instantiated
//         expect(mockSurveyInstance.save).toHaveBeenCalledTimes(1); // Check that save was called on the instance
//         expect(mockRes.status).toHaveBeenCalledWith(201);
//         expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
//             message: 'Survey created successfully',
//             survey: expect.any(Object)
//         }));
//     });
// });
//################ Version 3 - e #################


//################ Version 2 - s #################
// // Place all jest.mock() calls at the top of the file
// jest.mock('../models/survey');
// jest.mock('../utils/tokenGenerator');

// // Then, import the modules you need
// const { createSurvey } = require('../controllers/surveyController');
// const Survey = require('../models/survey');

// describe('Survey Controller', () => {
//     // This runs before each test to clear mocks and reset values
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     it('should create a survey successfully', async () => {
//         // Arrange
//         const mockReq = {
//             body: {
//                 title: 'Test Survey',
//                 questions: [{
//                     text: 'Test Question',
//                     type: 'TEXTBOX',
//                     spec: { maxLength: 50 }
//                 }]
//             }
//         };
//         const mockRes = {
//             status: jest.fn(() => mockRes),
//             json: jest.fn()
//         };
        
//         // Correctly apply the mock implementation to the Mongoose model
//         Survey.mockImplementation(() => ({
//             save: jest.fn().mockResolvedValue(mockReq.body)
//         }));

//         // Mock the token generator to return a predictable value
//         require('../utils/tokenGenerator').generateToken.mockReturnValue('abcde');

//         // Act
//         await createSurvey(mockReq, mockRes);

//         // Assert
//         expect(mockRes.status).toHaveBeenCalledWith(201);
//         expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
//             title: 'Test Survey'
//         }));
//     });
// });
//################ Version 2 - e #################

//################ Version 1 - s #################
// jest.mock('../models/survey');
// jest.mock('../utils/tokenGenerator');
// // Import the controller function you want to test
// // const { createSurvey, updateSurvey,deleteSurvey,getSurveyByToken } = require('../controllers/surveyController');
// const { createSurvey } = require('../controllers/surveyController');

// // Mock the Survey model
// const Survey = require('../models/survey');
// // jest.mock('../models/survey');

// // Mock a helper function if you have one
// const { generateToken } = require('../utils/tokenGenerator');
// // jest.mock('../utils/tokenGenerator');

// describe('Survey Controller', () => {
//     // This runs before each test to clear mocks and reset values
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     it('should create a survey successfully', async () => {
//         // Arrange
//         const mockReq = {
//             body: {
//                 title: 'Test Survey',
//                 questions: [{
//                     text: 'Test Question',
//                     type: 'TEXTBOX',
//                     spec: { maxLength: 50 }
//                 }]
//             }
//         };
//         const mockRes = {
//             status: jest.fn(() => mockRes),
//             json: jest.fn()
//         };
        
//         // Mock the return value of your model's save method
//         Survey.mockImplementation(() => ({
//             save: jest.fn().mockResolvedValue(mockReq.body)
//         }));

//         generateToken.mockReturnValue('abcde');

//         // Act
//         await createSurvey(mockReq, mockRes);

//         // Assert
//         expect(mockRes.status).toHaveBeenCalledWith(201);
//         expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
//             title: 'Test Survey'
//         }));
//     });
// });
//################ Version 1 - e #################