import mongoose from 'mongoose';

const sharedProjectSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    shareToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const SharedProject = mongoose.model('SharedProject', sharedProjectSchema);
export default SharedProject;
export { SharedProject };
