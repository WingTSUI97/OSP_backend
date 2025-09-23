const mongoose = jest.createMockFromModule('mongoose');

// This is a simple mock of the Mongoose connect function
mongoose.connect = jest.fn().mockResolvedValue(true);

// This is the CRITICAL part.
// We are mocking the entire mongoose.model function to return a mock class.
// This mock class can be used to create new instances (new Model())
// and those instances will have their own mock methods (like .save()).
mongoose.model = jest.fn((name) => {
  const MockModel = jest.fn();
  
  // Mocks a static method on the model itself, like Model.find()
  MockModel.find = jest.fn().mockResolvedValue([]);
  MockModel.findOne = jest.fn().mockResolvedValue({});
  MockModel.findById = jest.fn().mockResolvedValue({});
  
  // This mocks the constructor of the model (what happens when you call new Model())
  MockModel.mockImplementation(() => {
    return {
      save: jest.fn().mockResolvedValue(true)
    };
  });
  
  return MockModel;
});

module.exports = mongoose;

// ########### Version 1 - s ###################
// const mongoose = jest.createMockFromModule('mongoose');

// // Mock mongoose.connect() to always resolve successfully
// mongoose.connect = jest.fn().mockResolvedValue(true);

// // Mock the model function to return an object with a mock save function
// // This is a common way to mock Mongoose models
// mongoose.model = jest.fn((name, schema) => ({
//     // This is the mock for the instance of the model (e.g., new Survey())
//     save: jest.fn().mockResolvedValue(true)
// }));

// module.exports = mongoose;
// ########### Version 1 - e ###################