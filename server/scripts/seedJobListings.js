/**
 * Reads server/data/job-listings.csv into MongoDB (jobs with importedFromCsv: true).
 * CLI: npm run seed:jobs
 * Also used at the end of npm run seed so CSV listings are not wiped.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Job = require('../models/Job');

const CSV_PATH = path.join(__dirname, '..', 'data', 'job-listings.csv');

function mapJobType(csv) {
  const t = (csv || '').trim();
  if (/full[- ]?time/i.test(t)) return 'Full-time';
  if (/part[- ]?time/i.test(t)) return 'Part-time';
  if (/contract/i.test(t)) return 'Contract';
  if (/intern/i.test(t)) return 'Internship';
  return 'Full-time';
}

function mapWorkMode(csv) {
  const t = (csv || '').trim().toLowerCase();
  if (t === 'onsite' || t === 'on-site') return 'On-site';
  if (t === 'remote') return 'Remote';
  if (t === 'hybrid') return 'Hybrid';
  return 'On-site';
}

function mapExperience(csv) {
  const t = (csv || '').trim().toLowerCase();
  if (t.includes('entry')) return 'Entry';
  if (t.includes('mid')) return 'Mid';
  if (t.includes('senior')) return 'Senior';
  if (t.includes('lead')) return 'Lead';
  return 'Mid';
}

async function ensureBranchesByCity() {
  const defaults = [
    { name: 'Islamabad HQ', city: 'Islamabad', address: 'Blue Area, Islamabad' },
    { name: 'Lahore Branch', city: 'Lahore', address: 'Gulberg, Lahore' },
    { name: 'Karachi Hub', city: 'Karachi', address: 'Shahrah-e-Faisal, Karachi' },
  ];
  const map = {};
  for (const d of defaults) {
    let b = await Branch.findOne({ city: d.city });
    if (!b) {
      b = await Branch.create(d);
      console.log(`Created branch: ${d.city}`);
    }
    map[d.city] = b._id;
  }
  return map;
}

async function getPosterUserId() {
  let u = await User.findOne({ role: 'admin' });
  if (!u) {
    u = await User.create({
      name: 'Listings Importer',
      email: 'listings-importer@hireflow.internal',
      passwordHash: `seed-${Date.now()}-${Math.random()}`,
      role: 'admin',
      isVerified: true,
    });
    console.log('Created system admin user for CSV jobs:', u.email);
  }
  return u._id;
}

/**
 * @param {{ closeConnection?: boolean }} options - set closeConnection: true when run as standalone script
 */
async function seedJobListingsFromCsv(options = {}) {
  const { closeConnection = false } = options;

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`Missing CSV: ${CSV_PATH}`);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  const cityToBranchId = await ensureBranchesByCity();
  const postedBy = await getPosterUserId();

  const deleted = await Job.deleteMany({ importedFromCsv: true });
  console.log(`Removed ${deleted.deletedCount} previous CSV-imported jobs.`);

  const docs = [];
  for (const row of rows) {
    const city = row.City || '';
    const branchId = cityToBranchId[city];
    if (!branchId) {
      console.warn(`Skipping row — unknown city "${city}":`, row['Job Title']);
      continue;
    }

    const company = row.Company || '';
    const title = row['Job Title'] || '';
    const industry = row.Industry || '';
    const workMode = mapWorkMode(row['Work Mode']);
    const experience = mapExperience(row['Experience Level']);
    const salary = row['Salary Range PKR'] || '';
    const skills = row['Skills Required'] || '';
    const year = parseInt(row['Posted Year'], 10) || new Date().getFullYear();

    const description = `${company} is hiring a ${title} in ${city}. Work mode: ${workMode}. Experience: ${experience}. Salary range (PKR): ${salary}.`;

    docs.push({
      title,
      company,
      description,
      department: industry,
      branch: branchId,
      type: mapJobType(row['Job Type']),
      workMode,
      experienceLevel: experience,
      salaryRange: salary,
      requirements: skills,
      seatsAvailable: 1,
      isOpen: true,
      postedBy,
      importedFromCsv: true,
      createdAt: new Date(`${year}-01-15T12:00:00.000Z`),
      updatedAt: new Date(),
    });
  }

  if (docs.length) {
    await Job.insertMany(docs);
  }

  console.log(`Inserted ${docs.length} jobs from job-listings.csv.`);

  if (closeConnection) {
    await mongoose.connection.close();
  }
}

module.exports = { seedJobListingsFromCsv };

if (require.main === module) {
  seedJobListingsFromCsv({ closeConnection: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
