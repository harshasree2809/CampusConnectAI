import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { createApp } from '../server/app';
import { User, Opportunity, Otp, Bookmark } from '../server/models/index';
import { csv, calendar } from '../src/utils/exports';
import { keywordMatch } from '../src/utils/resume';
import { getDeadlineInfo } from '../src/utils/dateUtils';

// Use a dedicated test database so we never pollute production data
const TEST_DB = 'mongodb://127.0.0.1:27017/campusconnect_backend_test';
process.env.ADMIN_EMAIL    = 'admin@test.invalid';
process.env.ADMIN_PASSWORD = 'Test-admin-secret-1234';
process.env.COLLEGE_EMAIL_DOMAINS = 'college.test';
process.env.MONGODB_URI    = TEST_DB;
delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_MODEL;

const year = new Date().getFullYear();

test('persistent backend: authentication, enrollment, ownership, CRUD, isolation and exports', async t => {
  // Connect to MongoDB test DB and wipe it clean before the suite
  await mongoose.connect(TEST_DB);
  await mongoose.connection.dropDatabase();

  const codes = new Map<string, string>();
  const { app } = createApp({ seed: false, sendOtp: async (email, code) => { codes.set(email, code); } });

  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as any).port}`;

  const call = async (p: string, body?: any, cookie = '', method = body === undefined ? 'GET' : 'POST', headers: any = {}) => {
    const r = await fetch(url + '/api' + p, {
      method,
      headers: {
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(cookie ? { cookie } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
    const content = r.headers.get('content-type');
    const data: any = content?.includes('application/json') ? await r.json() : await r.text();
    return { status: r.status, data, cookie: r.headers.getSetCookie().map(s => s.split(';')[0]).join(';') };
  };

  let admin = '', student = '', other = '', kyc = '';
  let studentId = '', otherId = '', kycId = '', oppId = '', appId = '';

  try {
    await t.test('anonymous access and demo credential bypass are rejected', async () => {
      assert.equal((await call('/state')).status, 401);
      assert.equal((await call('/auth/login', { email: 'faculty@college.test', password: 'anything' })).status, 401);
      const r = await call('/auth/login', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
      assert.equal(r.status, 200);
      admin = r.cookie;
      assert(!('passwordHash' in r.data.user));
    });

    const register = async (email: string, method = 'college_email') => {
      assert.equal((await call('/auth/otp', { email })).status, 200);
      const r = await call('/auth/register', {
        email, name: email.split('@')[0], password: 'Student-secret-1234',
        otp: codes.get(email), role: 'student', method, department: 'CSE',
        rollNumber: 'TEST-' + email, graduationYear: year + 1,
      });
      assert.equal(r.status, 201);
      return r;
    };

    await t.test('OTP expiry, attempt limit, resend limit, uniqueness and approval gate', async () => {
      assert.equal((await call('/auth/otp', { email: 'wrong@college.test' })).status, 200);
      assert.equal((await call('/auth/otp', { email: 'wrong@college.test' })).status, 429);

      const fields = { email: 'wrong@college.test', name: 'Wrong', password: 'Student-secret-1234', role: 'student', department: 'CSE', rollNumber: 'X', graduationYear: year + 1 };
      for (let i = 0; i < 5; i++) assert.equal((await call('/auth/register', { ...fields, otp: '000000' })).status, 400);
      // 5 failed attempts exhausted — even the real code must fail now
      assert.equal((await call('/auth/register', { ...fields, otp: codes.get(fields.email) })).status, 400);

      // Manually expire the OTP to test expired-code rejection
      await Otp.updateOne({ email: fields.email }, { expires: 0, attempts: 0 });
      assert.equal((await call('/auth/register', { ...fields, otp: codes.get(fields.email) })).status, 400);

      const r = await register('one@college.test');
      student = r.cookie; studentId = r.data.user.id;
      assert.equal(r.data.user.isVerified, false);
      assert.equal((await call('/opportunities', { title: 'Blocked' }, student)).status, 403);
      assert.equal((await call('/auth/register', { ...fields, email: 'one@college.test' })).status, 409);
      assert.equal((await call(`/users/${studentId}/decision`, { status: 'approved' }, student)).status, 403);
      assert.equal((await call(`/users/${studentId}/decision`, { status: 'approved' }, admin)).status, 200);

      const r2 = await register('two@college.test');
      other = r2.cookie; otherId = r2.data.user.id;
      assert.equal((await call(`/users/${otherId}/decision`, { status: 'approved' }, admin)).status, 200);
    });

    const opportunity = () => ({
      title: 'Python developer', company: 'Campus Test', category: 'internship',
      description: 'Python, SQL and React', eligibilityBatches: [year + 1],
      eligibleBranches: ['CSE'], stipendOrSalary: 'INR 12000 / month',
      compensationAmount: 12000, compensationCurrency: 'INR', compensationPeriod: 'month',
      location: 'Remote', applyUrl: 'https://example.com/apply',
      deadline: new Date(Date.now() + 48 * 3600000).toISOString(),
    });

    await t.test('post edit/delete ownership and actual changed deadline', async () => {
      const r = await call('/opportunities', opportunity(), student);
      assert.equal(r.status, 201);
      oppId = r.data.id;
      assert.equal((await call(`/opportunities/${oppId}`, opportunity(), other, 'PATCH')).status, 403);
      assert.equal((await call(`/opportunities/${oppId}`, {}, other, 'DELETE')).status, 403);
      assert.equal((await call(`/opportunities/${oppId}/pin`, {}, student)).status, 403);
      const deadline = new Date(Date.now() + 72 * 3600000).toISOString();
      assert.equal((await call(`/opportunities/${oppId}`, { ...opportunity(), deadline }, student, 'PATCH')).status, 200);
      assert.equal((await call('/state', undefined, student)).data.opportunities[0].deadline, deadline);
      assert.equal((await call('/opportunities', { ...opportunity(), applyUrl: 'javascript:alert(1)' }, student)).status, 400);
    });

    await t.test('bookmarks and notifications belong to each account', async () => {
      assert.equal((await call(`/opportunities/${oppId}/bookmark`, {}, student)).status, 200);
      assert.deepEqual((await call('/state', undefined, other)).data.savedOppIds, []);
      assert.deepEqual((await call('/state', undefined, student)).data.savedOppIds, [oppId]);
      assert.equal((await call(`/opportunities/${oppId}/like`, {}, student)).status, 200);
      assert.equal((await call(`/opportunities/${oppId}/comment`, { text: 'Is this remote?' }, student)).status, 200);
    });

    await t.test('tracking validates eligibility, prevents duplicates and protects other users', async () => {
      const r = await call('/applications', { opportunityId: oppId }, student);
      assert.equal(r.status, 201);
      appId = r.data.id;
      assert.equal((await call('/applications', { opportunityId: oppId }, student)).data.id, appId);
      assert.equal((await call(`/applications/${appId}`, { status: 'offered' }, other, 'PATCH')).status, 403);
      assert.equal((await call(`/applications/${appId}`, {}, other, 'DELETE')).status, 403);
      assert.equal((await call(`/applications/${appId}`, { status: 'interview', notes: 'My notes' }, student, 'PATCH')).status, 200);
      assert.equal((await call('/state', undefined, other)).data.applications.length, 0);

      // Temporarily change 'other' to ECE branch — should be ineligible (opp is CSE only)
      const before = await User.findOne({ id: otherId });
      await User.updateOne({ id: otherId }, { department: 'ECE' });
      assert.equal((await call('/applications', { opportunityId: oppId }, other)).status, 403);
      await User.updateOne({ id: otherId }, { department: before!.department });
    });

    await t.test('event create edit delete requires staff and validates time range', async () => {
      const e = {
        title: 'Interview', company: 'Campus Test', eventType: 'interview',
        date: new Date(Date.now() + 3600000).toISOString(),
        endDate: new Date(Date.now() + 7200000).toISOString(),
        location: 'Room 2', eligibleBatches: [year + 1], notes: 'Bring ID', opportunityId: oppId,
      };
      assert.equal((await call('/events', e, student)).status, 403);
      assert.equal((await call('/events', { ...e, endDate: e.date }, admin)).status, 400);
      assert.equal((await call('/events', e, admin)).status, 201);
      const id = (await call('/state', undefined, admin)).data.driveEvents[0].id;
      assert.equal((await call(`/events/${id}`, { ...e, title: 'Updated interview' }, admin, 'PATCH')).status, 200);
      assert.equal((await call(`/events/${id}`, {}, admin, 'DELETE')).status, 200);
    });

    await t.test('expiry is enforced by the backend', async () => {
      // Directly expire the opportunity in MongoDB
      await Opportunity.updateOne({ id: oppId }, { deadline: new Date(Date.now() - 1000).toISOString() });
      assert.equal((await call('/applications', { opportunityId: oppId }, other)).status, 400);
      // Restore deadline
      await Opportunity.updateOne({ id: oppId }, { deadline: new Date(Date.now() + 48 * 3600000).toISOString() });
    });

    await t.test('actual ID uploads stay private and admin decisions change access', async () => {
      // Create a KYC-method user directly in MongoDB
      const template = await User.findOne({ id: otherId });
      kycId = 'kyc-student';
      await User.create({
        ...template!.toObject(),
        _id: undefined, id: kycId,
        email: 'kyc@personal.test',
        verificationMethod: 'id_card_kyc',
        verificationStatus: 'pending',
        isVerified: false,
      });
      const login = await call('/auth/login', { email: 'kyc@personal.test', password: 'Student-secret-1234' });
      kyc = login.cookie;

      assert.equal((await call(`/users/${kycId}/decision`, { status: 'approved' }, admin)).status, 400);

      const form = new FormData();
      const png  = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
      form.append('idCard', new Blob([png], { type: 'image/png' }), 'id.png');
      form.append('photo',  new Blob([png], { type: 'image/png' }), 'photo.png');
      assert.equal((await call('/kyc', form, kyc)).status, 201);

      const state     = (await call('/state', undefined, kyc)).data;
      assert.equal(state.kycSubmissions[0].status, 'pending');
      assert.equal(state.kycSubmissions[0].matchScore, null);
      const fileUrl   = state.kycSubmissions[0].idCardUrl.replace('/api', '');
      assert.equal((await call(fileUrl, undefined, other)).status, 404);
      assert.equal((await call(fileUrl, undefined, admin)).status, 200);

      assert.equal((await call(`/users/${kycId}/decision`, { status: 'approved' }, admin)).status, 200);
      assert.equal((await call('/state', undefined, kyc)).data.currentUser.isVerified, true);
      assert.equal((await call(`/users/${kycId}/decision`, { status: 'rejected' }, admin)).status, 200);
      assert.equal((await call('/opportunities', opportunity(), kyc)).status, 403);
      assert.equal((await call('/state', undefined, kyc)).data.opportunities.length, 0);
    });

    await t.test('AI missing configuration, invalid PDF and untrusted origins are clear failures', async () => {
      assert.equal((await call('/ai/chat', { query: 'jobs' }, student)).status, 503);
      const form = new FormData();
      form.append('resume', new Blob(['not a pdf'], { type: 'application/pdf' }), 'fake.pdf');
      assert.equal((await call('/resume', form, student)).status, 400);
      assert.equal((await call('/opportunities', opportunity(), student, 'POST', { Origin: 'https://untrusted.invalid' })).status, 403);
    });

    await t.test('valid PDF resume is parsed without storing the file', async () => {
      const pdf = Buffer.from('JVBERi0xLjMKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0NvbnRlbnRzIDcgMCBSIC9NZWRpYUJveCBbIDAgMCA1OTUuMjc1NiA4NDEuODg5OCBdIC9QYXJlbnQgNiAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNCAwIG9iago8PAovUGFnZU1vZGUgL1VzZU5vbmUgL1BhZ2VzIDYgMCBSIC9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9BdXRob3IgKGFub255bW91cykgL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MTAyMjE2MTMyMSswNScwMCcpIC9DcmVhdG9yIChhbm9ueW1vdXMpIC9LZXl3b3JkcyAoKSAvTW9kRGF0ZSAoRDoyMDI2MTAyMjE2MTMyMSswNScwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0ICh1bnNwZWNpZmllZCkgL1RpdGxlICh1bnRpdGxlZCkgL1RyYXBwZWQgL0ZhbHNlCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9Db3VudCAxIC9LaWRzIFsgMyAwIFIgXSAvVHlwZSAvUGFnZXMKPj4KZW5kb2JqCjcgMCBvYmoKPDwKL0ZpbHRlciBbIC9BU0NJSTg1RGVjb2RlIC9GbGF0ZURlY29kZSBdIC9MZW5ndGggMTIwCj4+CnN0cmVhbQpHYXBRaDBFPUYsMFVcSDNUXHBOWVReUUtrP3RjPklQLDtXI1UxXjIzaWhQRU1fP0NXNEtJU2k5ME1qR14yLEZTIzxSOyNNL0JQdVo7WzxtKjskXWNnOUowMGo4aERbPzoiPDJLYVxpRGwhYmtXbCFXWHRAKE1Ffj5lbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA2MSAwMDAwMCBuIAowMDAwMDAwMDkyIDAwMDAwIG4gCjAwMDAwMDAxOTkgMDAwMDAgbiAKMDAwMDAwMDQwMiAwMDAwMCBuIAowMDAwMDAwNDcwIDAwMDAwIG4gCjAwMDAwMDA3MzEgMDAwMDAgbiAKMDAwMDAwMDc5MCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9JRCAKWzw1YTdiNjVjNGQ5NzA5Y2MyZDRjYTU0ZWVmMWE2M2M3ND48NWE3YjY1YzRkOTcwOWNjMmQ0Y2E1NGVlZjFhNjNjNzQ+XQolIFJlcG9ydExhYiBnZW5lcmF0ZWQgUERGIGRvY3VtZW50IC0tIGRpZ2VzdCAob3BlbnNvdXJjZSkKCi9JbmZvIDUgMCBSCi9Sb290IDQgMCBSCi9TaXplIDgKPj4Kc3RhcnR4cmVmCjEwMDAKJSVFT0YK', 'base64');
      const body = new FormData();
      body.append('resume', new Blob([pdf], { type: 'application/pdf' }), 'resume.pdf');
      const r = await call('/resume', body, other);
      assert.equal(r.status, 200, JSON.stringify(r.data));
      assert(r.data.text.includes('Python SQL React resume'));
    });

    await t.test('logout revokes session', async () => {
      assert.equal((await call('/auth/logout', {}, student)).status, 200);
      assert.equal((await call('/state', undefined, student)).status, 401);
    });

  } finally {
    await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

test('CSV escaping and spreadsheet formula protection', () => {
  const content = csv([['Name', 'Notes'], ['A "quoted", name', '=HYPERLINK("https://example.com")'], ['B', 'line1\nline2']]);
  assert(content.includes('"A ""quoted"", name"'));
  assert(content.includes("\"'=HYPERLINK"));
  assert(content.includes('\r\n'));
});

test('calendar IDs, timestamp, escaping, CRLF, nonzero duration and UTF-8 folding', () => {
  const content = calendar(
    [{ id: 'one', company: 'Test', title: 'Long '.repeat(40) + 'తెలుగు', date: '2026-10-22T10:00:00Z', location: 'Room 1, A;B', notes: 'First\nSecond' }],
    new Date('2026-10-21T10:00:00Z'),
  );
  assert(content.includes('UID:one@campus-connect'));
  assert(content.includes('DTSTAMP:20261021T100000Z'));
  assert(content.includes('DTEND:20261022T110000Z'));
  assert(content.includes('Room 1\\, A\\;B'));
  assert(content.includes('First\\nSecond'));
  for (const line of content.split('\r\n')) assert(Buffer.byteLength(line) <= 75);
});

test('resume score uses evidence, recognizes boundaries and never invents skills', () => {
  assert.deepEqual(keywordMatch('gardening', 'Python and SQL'), { matched: [], missing: ['python', 'sql'], score: 0 });
  assert.deepEqual(keywordMatch('JavaScript', 'Java'), { matched: [], missing: ['java'], score: 0 });
  assert.equal(keywordMatch('Python, SQL', 'Python SQL').score, 100);
  assert.equal(keywordMatch('anything', 'We need a friendly person').score, null);
  assert.equal(keywordMatch('C++ and Node.js', 'C++ Node.js').score, 100);
});

test('deadline boundaries and invalid dates', () => {
  assert(getDeadlineInfo('not a date').isExpired);
  assert(getDeadlineInfo(new Date(Date.now() + 24.1 * 3600000).toISOString()).isUrgent24h === false);
  assert(getDeadlineInfo(new Date(Date.now() - 1000).toISOString()).isExpired);
});
