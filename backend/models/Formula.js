import mongoose from 'mongoose';

const formulaSchema = new mongoose.Schema(
  {
    topicId: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      index: true,
    },
    subtopic: {
      type: String,
      required: [true, 'Subtopic is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Formula title is required'],
      trim: true,
      index: true,
    },
    formula: {
      type: String,
      required: [true, 'Formula expression is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    example: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Compound text index for powerful keyword search
formulaSchema.index({
  title: 'text',
  formula: 'text',
  description: 'text',
  topic: 'text',
  subtopic: 'text',
  tags: 'text',
});

const Formula = mongoose.model('Formula', formulaSchema);

export default Formula;

