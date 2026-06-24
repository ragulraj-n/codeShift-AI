import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parentFolder: {
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

// Unique index only enforced for non-deleted folders
folderSchema.index(
  { owner: 1, name: 1, parentFolder: 1 },
  { 
    unique: true,
    partialFilterExpression: { isDeleted: false }
  }
);

// Performance index for list queries
folderSchema.index({ owner: 1, isDeleted: 1 });
folderSchema.index({ owner: 1, parentFolder: 1, isDeleted: 1 });

const Folder = mongoose.model('Folder', folderSchema);
export default Folder;
export { Folder };
