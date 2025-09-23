# Online Survey Platform(Backend)

## Overview & Assumptions
Build a small RESTful API server for creating surveys, retrieving them by a public token, submitting responses, and listing responses.


## Features
- Express
- REST API
- MonggoDB
- Mongoose


## Requirements
- [node & npm](https://nodejs.org/en)
- [git](https://docs.github.com/en/get-started/git-basics/set-up-git)


## Installation
- (optional) Install [NodeJS](https://nodejs.org/en) if needed
- `git clone https://github.com/WingTSUI97/OSP_backend`
- `cd OSP_backend`
- `npm install`
- Create a .env file in the root directory, then add your MongoDB connection string and Admin API Key:
   ```bash
   PORT=7001
   MONGO_URI=your_mongodb_connection_string
   ADMIN_API_KEY=YOUR_ADMIN_API_KEY_here
   ```


## API Description

### APIs Endpoints
- visit http://localhost:7001 or http://localhost:7001 by default 
  - POST /api/admin/surveys
  - PUT /api/admin/surveys/:id
  - GET /api/surveys/:token
  - POST /api/surveys/:token/responses
  - GET /api/admin/surveys/:id/responses
  - DELETE /api/admin/surveys/:id


### Examples with THUNDER CLIENT
1. Create a survey:
   - URL: http://localhost:7001/api/admin/surveys
   - Method: POST
   - Header:
      - X-API-Key: YOUR_ADMIN_API_KEY_here
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
   - Copy the ‘_id’ at end of the Response, which is **THE_SURVEY_ID**

2. Update a survey:
   - URL: http://localhost:7001/api/admin/surveys/THE_SURVEY_ID
   - Method: PUT
   - Header:
      - X-API-Key: YOUR_ADMIN_API_KEY_here
   - Body: JSON (application/json)
   - Body Content: 
   ```JSON
   {
      "title": "Feedback Survey (Updated)"
   }
   ```
   - Record the token as **YOUR_SURVEY_TOKEN**

3. Fetch a Survey:
   - URL: http://localhost:7001/api/surveys/YOUR_SURVEY_TOKEN
   - Method: GET
   - Record each questions ‘_id’ and the corresponding question type at response 

4. Submit a Response:
   - URL: http://localhost:7001/api/surveys/YOUR_SURVEY_TOKEN/responses
   - Method: POST
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
   - URL: http://localhost:7001/api/admin/surveys/THE_SURVEY_ID/responses
   - Method: GET
   - Header:
      - X-API-Key: YOUR_ADMIN_API_KEY_here

6. Delete a survey:
   - URL: http://localhost:7001/api/admin/surveys/THE_SURVEY_ID/responses
   - Method: DELETE
   - Header:
      - X-API-Key: YOUR_ADMIN_API_KEY_here


## Limitations & "If More Time"
- \<OnHold>


## AI Tool Usage
- \<OnHold>