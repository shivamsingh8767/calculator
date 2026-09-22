import mongoose from 'mongoose';
import CalculationHistory from '../models/CalculationHistory.js';

/**
 * @desc    Save a new calculation record
 * @route   POST /api/history
 */
export const createHistory = async (req, res, next) => {
  try {
    const { expression, result, formattedResult, type, angleMode } = req.body;

    // Strict validation
    if (!expression || typeof expression !== 'string' || !expression.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Expression is required and must be a non-empty string',
      });
    }

    if (expression.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Expression cannot exceed 1000 characters',
      });
    }

    if (result === undefined || result === null || String(result).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Calculation result is required',
      });
    }

    if (String(result).trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Result string cannot exceed 200 characters',
      });
    }

    const normalizedType = String(type || 'normal').toLowerCase();
    if (!['normal', 'scientific'].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'normal' or 'scientific'",
      });
    }

    let normalizedAngleMode = null;
    if (angleMode !== undefined && angleMode !== null) {
      const modeStr = String(angleMode).toUpperCase().trim();
      if (['DEG', 'RAD'].includes(modeStr)) {
        normalizedAngleMode = modeStr;
      } else if (modeStr !== '') {
        return res.status(400).json({
          success: false,
          message: 'Angle mode must be DEG, RAD, or null',
        });
      }
    }

    const historyRecord = await CalculationHistory.create({
      expression: expression.trim(),
      result: String(result).trim(),
      formattedResult: formattedResult ? String(formattedResult).trim() : String(result).trim(),
      type: normalizedType,
      angleMode: normalizedAngleMode,
    });

    res.status(201).json({
      success: true,
      data: historyRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get calculation history
 * @route   GET /api/history?limit=50
 */
export const getHistory = async (req, res, next) => {
  try {
    const rawLimit = req.query.limit;
    let limit = 50;

    if (rawLimit !== undefined) {
      const parsed = parseInt(rawLimit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 200);
      }
    }

    const history = await CalculationHistory.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single calculation record by ID
 * @route   GET /api/history/:id
 */
export const getHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'History record ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${id}`,
      });
    }

    const record = await CalculationHistory.findById(id).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Calculation record not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete single calculation record by ID
 * @route   DELETE /api/history/:id
 */
export const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'History record ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${id}`,
      });
    }

    const deleted = await CalculationHistory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Calculation record not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Calculation record deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all calculation history records
 * @route   DELETE /api/history
 */
export const clearHistory = async (req, res, next) => {
  try {
    const result = await CalculationHistory.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'Calculation history cleared successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

