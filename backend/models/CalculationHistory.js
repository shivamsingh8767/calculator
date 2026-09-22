import mongoose from 'mongoose';

const calculationHistorySchema = new mongoose.Schema(
  {
    expression: {
      type: String,
      required: [true, 'Expression is required'],
      trim: true,
      maxlength: [1000, 'Expression cannot exceed 1000 characters'],
    },
    result: {
      type: String,
      required: [true, 'Calculation result is required'],
      trim: true,
      maxlength: [200, 'Result string cannot exceed 200 characters'],
    },
    formattedResult: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      required: [true, 'Calculator type is required'],
      enum: {
        values: ['normal', 'scientific'],
        message: '{VALUE} is not a supported calculator type (must be normal or scientific)',
      },
      index: true,
    },
    angleMode: {
      type: String,
      enum: {
        values: ['DEG', 'RAD', null],
        message: '{VALUE} is not a valid angle mode (must be DEG, RAD, or null)',
      },
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

calculationHistorySchema.index({ createdAt: -1 });

const CalculationHistory = mongoose.model('CalculationHistory', calculationHistorySchema);

export default CalculationHistory;
