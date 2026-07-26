import mongoose from 'mongoose';

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
  'Closed',
];

export const LEAD_SOURCES = ['Website', 'LinkedIn', 'Instagram', 'Referral', 'Walk-in'];

export const LEAD_CATEGORIES = [
  'Enterprise',
  'SMB',
  'Startup',
  'Individual',
  'Partner',
  'Other',
];

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'created',
        'status_changed',
        'assigned',
        'note_added',
        'tag_added',
        'tag_removed',
        'category_changed',
        'file_uploaded',
        'updated',
      ],
      required: true,
    },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    budget: {
      type: String,
      required: [true, 'Budget is required'],
      enum: ['Below $500', '$500-$1000', '$1000-$5000', 'Above $5000'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'New',
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      default: 'Website',
    },
    category: {
      type: String,
      default: '',
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: [noteSchema],
    activities: [activitySchema],
    attachments: [attachmentSchema],
    aiAnalysis: {
      summary: { type: String, default: '' },
      priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium',
      },
      category: { type: String, default: '' },
      tags: [{ type: String }],
      estimatedDealValue: { type: Number, default: 0 },
      sentiment: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative'],
        default: 'Neutral',
      },
      confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
      leadScore: { type: Number, min: 0, max: 100, default: 0 },
      recommendedNextAction: { type: String, default: '' },
      analyzedAt: { type: Date },
    },
    followUpEmail: {
      subject: { type: String, default: '' },
      body: { type: String, default: '' },
      generatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', email: 'text', message: 'text', tags: 'text' });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ category: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ 'aiAnalysis.priority': 1 });
leadSchema.index({ 'aiAnalysis.leadScore': -1 });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
