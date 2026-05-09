const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

// 5050 default avoids macOS AirPlay on 5000 and common dev collisions on 5001.
const PORT = Number(process.env.PORT) ||  5055;
const CSV_PATH = path.join(__dirname, 'data', 'job-listings.csv');

let cachedJobs = null;

function loadJobsFromCsv() {
  if (cachedJobs) return cachedJobs;
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  cachedJobs = rows.map((row, index) => {
    const city = row.City || '';
    const title = row['Job Title'] || '';
    const company = row.Company || '';
    const industry = row.Industry || '';
    const jobType = row['Job Type'] || '';
    const experience = row['Experience Level'] || '';
    const workMode = row['Work Mode'] || '';
    const salary = row['Salary Range PKR'] || '';
    const skills = row['Skills Required'] || '';
    const year = row['Posted Year'] || '2026';

    return {
      _id: `listing-${index}`,
      title,
      company,
      department: industry,
      branch: city,
      type: jobType,
      workMode,
      experienceLevel: experience,
      salaryRange: salary,
      requirements: skills,
      description: `${company} is hiring a ${title} in ${city}. Work mode: ${workMode}. Experience: ${experience}. Salary range (PKR): ${salary}.`,
      seatsAvailable: 1,
      createdAt: `${year}-01-15`,
    };
  });

  return cachedJobs;
}

function matchesSearch(job, q) {
  const hay = [
    job.title,
    job.company,
    job.department,
    job.branch,
    job.requirements,
    job.type,
    job.workMode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/jobs', (req, res) => {
  try {
    let jobs = loadJobsFromCsv();
    const { branch, search } = req.query;

    if (branch && branch !== 'All') {
      jobs = jobs.filter((j) => j.branch === branch);
    }
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      jobs = jobs.filter((j) => matchesSearch(j, q));
    }

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load job listings', jobs: [] });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  try {
    const jobs = loadJobsFromCsv();
    const job = jobs.find((j) => j._id === req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load job' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`ATS API listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[EADDRINUSE] Port ${PORT} is already in use. Change PORT in server/.env, or stop the other listener:\n` +
        `  lsof -nP -iTCP:${PORT} -sTCP:LISTEN`
    );
  }
  process.exit(1);
});
