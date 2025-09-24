const mongoose = jest.createMockFromModule('mongoose');

// Mock mongoose.connect() to always resolve successfully
mongoose.connect = jest.fn().mockResolvedValue(true);
mongoose.disconnect = jest.fn().mockResolvedValue(true);

// Mock mongoose.Schema
mongoose.Schema = jest.fn().mockImplementation(() => ({
  add: jest.fn(),
  pre: jest.fn(),
  post: jest.fn(),
  methods: {},
  statics: {},
  virtual: jest.fn(),
  set: jest.fn(),
  get: jest.fn()
}));

// Mock mongoose.model function to return a comprehensive mock class
mongoose.model = jest.fn((name) => {
  const MockModel = jest.fn();
  
  // Static methods that return promises
  MockModel.find = jest.fn().mockResolvedValue([]);
  MockModel.findOne = jest.fn().mockResolvedValue(null);
  MockModel.findById = jest.fn().mockResolvedValue(null);
  MockModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
  MockModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);
  MockModel.create = jest.fn().mockResolvedValue({});
  MockModel.countDocuments = jest.fn().mockResolvedValue(0);
  MockModel.deleteMany = jest.fn().mockResolvedValue({});
  MockModel.updateMany = jest.fn().mockResolvedValue({});
  
  // Mock constructor - what happens when you call new Model()
  MockModel.mockImplementation((data) => {
    const instance = {
      ...data,
      _id: data?._id || 'mock_id_' + Math.random().toString(36).substr(2, 9),
      save: jest.fn().mockResolvedValue({
        ...data,
        _id: data?._id || 'mock_id_' + Math.random().toString(36).substr(2, 9)
      }),
      toObject: jest.fn().mockReturnValue(data || {}),
      toJSON: jest.fn().mockReturnValue(data || {}),
      validate: jest.fn().mockResolvedValue(true),
      isModified: jest.fn().mockReturnValue(false),
      markModified: jest.fn(),
      set: jest.fn(),
      get: jest.fn()
    };
    
    // Add id() method for subdocuments (like questions.id())
    instance.id = jest.fn().mockImplementation((id) => {
      if (instance.questions && Array.isArray(instance.questions)) {
        return instance.questions.find(q => q._id?.toString() === id) || null;
      }
      return null;
    });
    
    return instance;
  });
  
  return MockModel;
});

// Mock mongoose.Schema.Types
mongoose.Schema.Types = {
  ObjectId: jest.fn(),
  Mixed: jest.fn(),
  String: jest.fn(),
  Number: jest.fn(),
  Date: jest.fn(),
  Boolean: jest.fn(),
  Array: jest.fn(),
  Buffer: jest.fn()
};

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