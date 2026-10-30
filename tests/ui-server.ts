// Isolated browser-test server. Credentials here never seed a normal app instance.
import mongoose from 'mongoose';
import { createApp, passwordHash } from '../server/app';
import { User, Opportunity } from '../server/models/index';

process.env.ADMIN_EMAIL    = 'browser-admin@test.invalid';
process.env.ADMIN_PASSWORD = 'Browser-admin-test-1234';
process.env.COLLEGE_EMAIL_DOMAINS = 'college.test';
process.env.APP_URL        = 'http://127.0.0.1:4173';
process.env.MONGODB_URI    = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect_browser_test';
delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_MODEL;

async function start() {
  await mongoose.connect(process.env.MONGODB_URI!);

  // Seed test-specific data
  await User.findOneAndUpdate(
    { id: 'browser-student' },
    {
      id: 'browser-student', name: 'Browser Student',
      email: 'browser-student@college.test',
      passwordHash: passwordHash('Browser-student-test-1234'),
      role: 'student', isVerified: true, verificationStatus: 'approved',
      graduationYear: new Date().getFullYear() + 1, department: 'CSE', rollNumber: 'TEST001',
    },
    { upsert: true },
  );
  await Opportunity.findOneAndUpdate(
    { id: 'browser-opp' },
    {
      id: 'browser-opp', title: 'Python intern', company: 'Browser Company',
      category: 'internship',
      description: 'Python SQL React. Work with the engineering team.',
      eligibilityBatches: [new Date().getFullYear() + 1], eligibleBranches: ['CSE'],
      stipendOrSalary: 'INR 12000 / month', compensationAmount: 12000,
      compensationCurrency: 'INR', compensationPeriod: 'month', location: 'Remote',
      applyUrl: 'https://example.com/apply',
      deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      authorId: 'browser-student', authorName: 'Browser Student', authorRole: 'student',
      postedAt: new Date().toISOString(), likes: [], comments: [], isPinned: false, isVerifiedByAdmin: false,
    },
    { upsert: true },
  );

  const { app } = createApp({ seed: false });
  const server  = app.listen(4173, '127.0.0.1');

  const close = async () => {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', close);
  process.on('SIGINT',  close);
}

start().catch(err => { console.error(err); process.exit(1); });
