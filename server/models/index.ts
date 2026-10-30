import mongoose, { Schema, Document } from 'mongoose';

// ─── User ────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  rollNumber?: string;
  graduationYear?: number;
  phone?: string;
  verificationMethod?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
}

const UserSchema = new Schema<IUser>({
  id:                 { type: String, required: true, unique: true },
  name:               { type: String, required: true },
  email:              { type: String, required: true, unique: true, lowercase: true },
  passwordHash:       { type: String, required: true },
  role:               { type: String, enum: ['student', 'faculty', 'admin'], required: true },
  department:         { type: String, default: '' },
  rollNumber:         { type: String, default: '' },
  graduationYear:     { type: Number },
  phone:              { type: String, default: '' },
  verificationMethod: { type: String, default: 'college_email' },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isVerified:         { type: Boolean, default: false },
}, { timestamps: true });

// ─── Opportunity ─────────────────────────────────────────────────────────────
export interface IOpportunity extends Document {
  id: string;
  title: string;
  company: string;
  category: string;
  description: string;
  eligibilityBatches: number[];
  eligibleBranches: string[];
  stipendOrSalary?: string;
  compensationAmount?: number | null;
  compensationCurrency?: string;
  compensationPeriod?: string;
  location?: string;
  applyUrl: string;
  deadline: string;
  preparationTips?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorDept?: string;
  authorBatch?: number;
  postedAt: string;
  likes: string[];
  comments: any[];
  isPinned: boolean;
  isVerifiedByAdmin: boolean;
}

const OpportunitySchema = new Schema<IOpportunity>({
  id:                  { type: String, required: true, unique: true },
  title:               { type: String, required: true },
  company:             { type: String, required: true },
  category:            { type: String, required: true },
  description:         { type: String, default: '' },
  eligibilityBatches:  [Number],
  eligibleBranches:    [String],
  stipendOrSalary:     { type: String, default: '' },
  compensationAmount:  { type: Number, default: null },
  compensationCurrency:{ type: String, default: 'INR' },
  compensationPeriod:  { type: String, default: 'month' },
  location:            { type: String, default: '' },
  applyUrl:            { type: String, required: true },
  deadline:            { type: String, required: true },
  preparationTips:     { type: String, default: '' },
  authorId:            { type: String, required: true },
  authorName:          { type: String, required: true },
  authorRole:          { type: String, required: true },
  authorDept:          { type: String, default: '' },
  authorBatch:         { type: Number },
  postedAt:            { type: String, required: true },
  likes:               [String],
  comments:            [Schema.Types.Mixed],
  isPinned:            { type: Boolean, default: false },
  isVerifiedByAdmin:   { type: Boolean, default: false },
}, { timestamps: true });

// ─── Application ─────────────────────────────────────────────────────────────
export interface IApplication extends Document {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  category: string;
  appliedDate: string;
  status: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRoll?: string;
  studentBranch?: string;
  studentBatch?: number;
  notes: string;
  nextStepDate: string;
}

const ApplicationSchema = new Schema<IApplication>({
  id:                { type: String, required: true, unique: true },
  opportunityId:     { type: String, required: true },
  opportunityTitle:  { type: String, required: true },
  company:           { type: String, required: true },
  category:          { type: String, required: true },
  appliedDate:       { type: String, required: true },
  status:            { type: String, required: true },
  applicationNumber: { type: String, required: true },
  studentId:         { type: String, required: true },
  studentName:       { type: String, required: true },
  studentEmail:      { type: String, required: true },
  studentRoll:       { type: String, default: '' },
  studentBranch:     { type: String, default: '' },
  studentBatch:      { type: Number },
  notes:             { type: String, default: '' },
  nextStepDate:      { type: String, default: '' },
}, { timestamps: true });

// ─── Drive Event ─────────────────────────────────────────────────────────────
export interface IDriveEvent extends Document {
  id: string;
  title: string;
  company: string;
  eventType: string;
  date: string;
  endDate: string;
  eligibleBatches: number[];
  location?: string;
  notes?: string;
  opportunityId?: string;
}

const DriveEventSchema = new Schema<IDriveEvent>({
  id:              { type: String, required: true, unique: true },
  title:           { type: String, required: true },
  company:         { type: String, required: true },
  eventType:       { type: String, required: true },
  date:            { type: String, required: true },
  endDate:         { type: String, required: true },
  eligibleBatches: [Number],
  location:        { type: String, default: '' },
  notes:           { type: String, default: '' },
  opportunityId:   { type: String },
}, { timestamps: true });

// ─── KYC Submission ──────────────────────────────────────────────────────────
export interface IKyc extends Document {
  id: string;
  userId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  passingYear: number;
  mobile: string;
  idCardUrl: string;
  passportPhotoUrl: string;
  videoCaptured: boolean;
  matchScore: number | null;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const KycSchema = new Schema<IKyc>({
  id:               { type: String, required: true, unique: true },
  userId:           { type: String, required: true },
  studentName:      { type: String, required: true },
  rollNumber:       { type: String, required: true },
  department:       { type: String, required: true },
  passingYear:      { type: Number, required: true },
  mobile:           { type: String, default: '' },
  idCardUrl:        { type: String, required: true },
  passportPhotoUrl: { type: String, required: true },
  videoCaptured:    { type: Boolean, default: false },
  matchScore:       { type: Number, default: null },
  status:           { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt:      { type: String, required: true },
}, { timestamps: true });

// ─── Upload (file stored as base64) ─────────────────────────────────────────
export interface IUpload extends Document {
  id: string;
  userId: string;
  mime: string;
  bytes: string; // base64
}

const UploadSchema = new Schema<IUpload>({
  id:     { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  mime:   { type: String, required: true },
  bytes:  { type: String, required: true },
}, { timestamps: true });

// ─── Bookmark ────────────────────────────────────────────────────────────────
export interface IBookmark extends Document {
  id: string;   // = userId
  ids: string[]; // opportunityIds
}

const BookmarkSchema = new Schema<IBookmark>({
  id:  { type: String, required: true, unique: true },
  ids: [String],
}, { timestamps: true });

// ─── Notification ────────────────────────────────────────────────────────────
export interface INotification extends Document {
  id: string;
  userId: string;
  title: string;
  message: string;
  opportunityId?: string;
  type: string;
  timestamp: string;
  isRead: boolean;
}

const NotificationSchema = new Schema<INotification>({
  id:            { type: String, required: true, unique: true },
  userId:        { type: String, required: true },
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  opportunityId: { type: String },
  type:          { type: String, default: 'general' },
  timestamp:     { type: String, required: true },
  isRead:        { type: Boolean, default: false },
}, { timestamps: true });

// ─── OTP ─────────────────────────────────────────────────────────────────────
export interface IOtp extends Document {
  email: string;
  digest: string;
  expires: number;
  attempts: number;
  sent: number;
}

const OtpSchema = new Schema<IOtp>({
  email:    { type: String, required: true, unique: true },
  digest:   { type: String, required: true },
  expires:  { type: Number, required: true },
  attempts: { type: Number, default: 0 },
  sent:     { type: Number, required: true },
}, { timestamps: true });

// ─── Meta (tracks initialization / seeding) ──────────────────────────────────
export interface IMeta extends Document {
  id: string;
  sampleData?: boolean;
}

const MetaSchema = new Schema<IMeta>({
  id:         { type: String, required: true, unique: true },
  sampleData: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Export models ────────────────────────────────────────────────────────────
// Use mongoose.Model<T> cast to avoid TS union-type errors from mongoose.models fallback
export const User         = (mongoose.models['User']         ?? mongoose.model<IUser>('User', UserSchema))                    as mongoose.Model<IUser>;
export const Opportunity  = (mongoose.models['Opportunity']  ?? mongoose.model<IOpportunity>('Opportunity', OpportunitySchema)) as mongoose.Model<IOpportunity>;
export const Application  = (mongoose.models['Application']  ?? mongoose.model<IApplication>('Application', ApplicationSchema)) as mongoose.Model<IApplication>;
export const DriveEvent   = (mongoose.models['DriveEvent']   ?? mongoose.model<IDriveEvent>('DriveEvent', DriveEventSchema))   as mongoose.Model<IDriveEvent>;
export const Kyc          = (mongoose.models['Kyc']          ?? mongoose.model<IKyc>('Kyc', KycSchema))                       as mongoose.Model<IKyc>;
export const Upload       = (mongoose.models['Upload']       ?? mongoose.model<IUpload>('Upload', UploadSchema))               as mongoose.Model<IUpload>;
export const Bookmark     = (mongoose.models['Bookmark']     ?? mongoose.model<IBookmark>('Bookmark', BookmarkSchema))         as mongoose.Model<IBookmark>;
export const Notification = (mongoose.models['Notification'] ?? mongoose.model<INotification>('Notification', NotificationSchema)) as mongoose.Model<INotification>;
export const Otp          = (mongoose.models['Otp']          ?? mongoose.model<IOtp>('Otp', OtpSchema))                       as mongoose.Model<IOtp>;
export const Meta         = (mongoose.models['Meta']         ?? mongoose.model<IMeta>('Meta', MetaSchema))                    as mongoose.Model<IMeta>;
