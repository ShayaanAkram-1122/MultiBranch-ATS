const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Job = require('../models/Job');
const Application = require('../models/Application');
const connectDB = require('../config/db');
const { seedJobListingsFromCsv } = require('./seedJobListings');

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Branch.deleteMany({});
  await Job.deleteMany({});
  await Application.deleteMany({});

  console.log('Creating branches...');
  const branches = await Branch.insertMany([
    { name: 'Islamabad HQ', city: 'Islamabad', address: 'Blue Area, Islamabad' },
    { name: 'Lahore Branch', city: 'Lahore', address: 'Gulberg, Lahore' },
    { name: 'Karachi Hub', city: 'Karachi', address: 'Shahrah-e-Faisal, Karachi' },
    { name: 'Remote Global', city: 'Remote', address: 'Work from Anywhere' }
  ]);

  console.log('Creating Admin user...');
  const admin = await User.create({
    name: 'HireFlow Admin',
    email: 'admin@hireflow.com',
    passwordHash: 'admin123', // Will be hashed by pre-save hook
    role: 'admin',
    branch: branches[0]._id // Assigning to HQ
  });

  console.log('Creating Candidate user...');
  const candidate = await User.create({
    name: 'Test Candidate',
    email: 'candidate@hireflow.com',
    passwordHash: 'candidate123',
    role: 'applicant',
    bio: 'Software engineer looking for new opportunities.',
  });

  console.log('Creating jobs...');
  await Job.insertMany([
    {
      title: 'Frontend Developer',
      description: 'Looking for a React developer to join our team.',
      department: 'Engineering',
      branch: branches[0]._id, // Islamabad
      type: 'Full-time',
      workMode: 'Hybrid',
      experienceLevel: 'Mid',
      salaryRange: '150000 - 200000',
      requirements: 'React, Node.js, CSS',
      seatsAvailable: 2,
      postedBy: admin._id,
      isOpen: true
    },
    {
      title: 'Backend Engineer',
      description: 'Strong backend engineer to work on our scalable microservices.',
      department: 'Engineering',
      branch: branches[1]._id, // Lahore
      type: 'Full-time',
      workMode: 'On-site',
      experienceLevel: 'Senior',
      salaryRange: '250000 - 350000',
      requirements: 'Node.js, Express, MongoDB, AWS',
      seatsAvailable: 1,
      postedBy: admin._id,
      isOpen: true
    },
    {
      title: 'UI/UX Designer',
      description: 'Creative designer to shape our product interfaces.',
      department: 'Design',
      branch: branches[3]._id, // Remote
      type: 'Contract',
      workMode: 'Remote',
      experienceLevel: 'Entry',
      salaryRange: '80000 - 120000',
      requirements: 'Figma, Adobe XD, Prototyping',
      seatsAvailable: 3,
      postedBy: admin._id,
      isOpen: true
    },
    {
      title: 'DevOps Engineer',
      description: 'Manage our cloud infrastructure and deployment pipelines.',
      department: 'DevOps',
      branch: branches[2]._id, // Karachi
      type: 'Full-time',
      workMode: 'On-site',
      experienceLevel: 'Mid',
      salaryRange: '200000 - 300000',
      requirements: 'Docker, Kubernetes, CI/CD',
      seatsAvailable: 2,
      postedBy: admin._id,
      isOpen: true
    }
  ]);

  console.log('Loading job-listings.csv into DB (does not remove the 4 demo jobs above)...');
  await seedJobListingsFromCsv({ closeConnection: false });

  console.log('Database seeded successfully! 🎉');
  console.log('--------------------------------------------------');
  console.log('Admin Login:      admin@hireflow.com / admin123');
  console.log('Candidate Login:  candidate@hireflow.com / candidate123');
  console.log('--------------------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
