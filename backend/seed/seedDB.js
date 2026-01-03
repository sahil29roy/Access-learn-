const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subject = require('../models/Subject');
const Content = require('../models/Content');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accessedu', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
const subjects = require('./subjects.json');
const poems = require('./poems.json');

const seedDB = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await Subject.deleteMany();
    await Content.deleteMany();
    
    // Insert subjects
    console.log('Inserting subjects...');
    await Subject.insertMany(subjects);
    
    // Get the English Poetry subject to link poems to
    const englishPoetrySubject = await Subject.findOne({ code: 'ENG201' });
    
    if (englishPoetrySubject) {
      // Add subject reference to poems
      const poemsWithSubject = poems.map(poem => ({
        ...poem,
        subject: englishPoetrySubject._id
      }));
      
      console.log('Inserting poems...');
      await Content.insertMany(poemsWithSubject);
    }
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();