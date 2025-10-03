# Online Survey Platform (Backend)

## Overview
This project is a RESTful API server.  It allows for the creation, management, and retrieval of surveys and their corresponding responses. The API is designed to handle both administrative tasks (creating/updating surveys, viewing responses) and participant actions (fetching a survey, submitting responses).

### Assumptions
- All data is stored in a MongoDB database.

- Administrative endpoints are protected by a single API key for simplicity.

- Survey tokens are short, public, and automatically generated.

## Features
- Backend Stack: Node.js and Express.js framework
- Database: MongoDB for data strorage, with Mongoose as (Object-Document Mapper) for schema management and interactions
- RESTful API 
- Authentication: API key-based authentication on administrative routes
- Automated Testing: Jest and Supertest for comprehensive unit and integration tests


## Requirements
- [node & npm](https://nodejs.org/en)
- [git](https://docs.github.com/en/get-started/git-basics/set-up-git)


## Installation
Follow these steps to set up and run the project locally.
1. Clone the repository:
   ```bash
   git clone https://github.com/WingTSUI97/OSP_backend
   cd OSP_backend
   ```

2. Install denpendencies
      ```bash
      npm install
      ```
3. Create a .env file in the root directory and add your MongoDB connection string and Admin API Key:
   ```bash
   PORT=7001
   MONGO_URI=your_mongodb_connection_string
   ADMIN_API_KEY=YOUR_ADMIN_API_KEY_here
   ```
   `MONGO_URI`: The connection string for your MongoDB database.
   `ADMIN_API_KEY`: A secret key required for authenticating with administrative endpoints.

## Run the Application
 - Development Mode:
   ```bash
      npm run dev
   ```
 - Production Mode:
   ```bash
      npm run start
   ```  
   The server will be running at http://localhost:7001 by default.
-  `npm run test:coverage` → to test with coverage

## Automated Testing
   - Run all tests:
   ```bash
   npm test
   ```
   - check test coverage:
   ```bash
   npm test:coverage
   ```
   This command runs all tests and generates a detailed coverage report, helping to identify untested code sections. The goal is to maintain a minimum of **80%** coverage.</br></br>
   The Overall Coverage:
   ```less
   All files | 93.47% statements | 93.67% branches | 90% funcs | 93.44% lines
   ```


## API Description
The API is designed with the following endpoints. You can test these using a tool like Thunder Client, Postman, or cURL. The base URL is http://localhost:7001.

### Admin Endpoints (/api/admin)
These endpoints require an X-API-Key header for authentication.
| Method  | Endpoint | Description  | 
| ------------- | ------------- | ------------- | 
| `POST`  | `/surveys`  | Creates a new survey. | 
| `PUT`  | `/surveys/:id`  | Updates an existing survey. | 
| `GET`  | `/surveys/:id/responses`  | Retrieves all responses for a survey. | 
| `DELETE`  | `/surveys/:id`  | 	Deletes a survey and its responses. | 

### Participant Endpoints (/api)
These endpoints require an X-API-Key header for authentication.
| Method  | Endpoint | Description  | 
| ------------- | ------------- | ------------- | 
| `GET`  | `/surveys/:token`  | Fetches a survey by its public token.. | 
| `PUT`  | `/surveys/:token/responses`  | Submits a new response to a survey. | 

### API Examples
Here are examples of how to interact with the API using a client like Thunder Client.
1. Create a survey:
   - URL: `http://localhost:7001/api/admin/surveys`
   - Method: `POST`
   - Header: `X-API-Key: YOUR_ADMIN_API_KEY_here`
   - Body: JSON (application/json)
   - Body Content: 
  ```JSON
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
   ```
   *From the response, copy the `_id` and save it as `THE_SURVEY_ID`.*

2. Update a survey:
   - URL: `http://localhost:7001/api/admin/surveys/THE_SURVEY_ID`
   - Method: `PUT`
   - Header:`X-API-Key: YOUR_ADMIN_API_KEY_here`
   - Body: JSON (application/json)
   - Body Content: 
   ```JSON
   {
      "title": "Feedback Survey (Updated)"
   }
   ```
   *From the response, record the `token` and save it as `YOUR_SURVEY_TOKEN`.*

3. Fetch a Survey:
   - URL: `http://localhost:7001/api/surveys/YOUR_SURVEY_TOKEN`
   - Method: `GET`
   - *From the response, record each question's `_id` for the next step.*

4. Submit a Response:
   - URL: `http://localhost:7001/api/surveys/YOUR_SURVEY_TOKEN/responses`
   - Method: `POST`
   - Body: JSON (application/json)
   - Body Content: 
  ```JSON
   {
      "answers": [
         {
               "questionId": "<YOUR_TEXTBOX_QUESTION_ID>",
               "value": "Your answer here"
         },
         {
               "questionId": "<YOUR_LIKERT_QUESTION_ID>",
               "value": 4
         },
         {
               "questionId": "<YOUR_MULTIPLE_CHOICE_QUESTION_ID>",
               "value": "Express"
         }
      ]
   }
  ```
   - Replace `<YOUR_TEXTBOX_QUESTION_ID>`, `<YOUR_LIKERT_QUESTION_ID>`, `<YOUR_MULTIPLE_CHOICE_QUESTION_ID>` with question ID your obtain from Submit a Response part
5. View  a response:
   - URL: `http://localhost:7001/api/admin/surveys/THE_SURVEY_ID/responses`
   - Method: `GET`
   - Header: `X-API-Key: YOUR_ADMIN_API_KEY_here`

6. Delete a survey:
   - URL: `http://localhost:7001/api/admin/surveys/THE_SURVEY_ID/responses`
   - Method: `DELETE`
   - Header: `X-API-Key: YOUR_ADMIN_API_KEY_here`


## Limitations & "If More Time"
- **API Key Management**: The current API uses a single, hardcoded API key for all administrative access. A more secure approach would be to implement a user authentication system (e.g., JWT-based) with different roles and permissions.

- **Error Handling**: While basic error handling is in place, more specific and user-friendly error messages could be added for different failure scenarios (e.g., database connection issues, validation errors).

- **Security**: Implement a more robust CORS policy, rate-limiting to prevent abuse, and input validation to protect against injection attacks.

## AI Tool Usage
- This project was developed with the assistance of an AI-powered code generator. The AI was used to provide guidance on best practices, debug issues, write tests, and generate boilerplate code.

- The AI's assistance was primarily focused on architectural design and test implementation (e.g., using `mongodb-memory-server` and `supertest`), and the final code was carefully reviewed and adapted to meet the project's requirements.