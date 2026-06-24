import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    sourceCode: {
      type: String,
      default: ''
    },
    outputCode: {
      type: String,
      default: ''
    },
    sourceLang: {
      type: String,
      required: true
    },
    targetLang: {
      type: String,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Unique index only enforced for non-deleted projects
projectSchema.index(
  { owner: 1, name: 1, folder: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false }
  }
);

// Performance index for folder listings and deletions
projectSchema.index({ folder: 1, isDeleted: 1 });
projectSchema.index({ owner: 1, isDeleted: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
export { Project };
