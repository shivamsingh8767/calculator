import mongoose from 'mongoose';
import Formula from '../models/Formula.js';

/**
 * @desc    Get all formulas
 * @route   GET /api/formulas
 */
export const getAllFormulas = async (req, res, next) => {
  try {
    const formulas = await Formula.find()
      .sort({ topic: 1, subtopic: 1, title: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: formulas.length,
      data: formulas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search formulas by keyword
 * @route   GET /api/formulas/search?q=...
 */
export const searchFormulas = async (req, res, next) => {
  try {
    const rawQuery = req.query.q;
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';

    if (!query) {
      return getAllFormulas(req, res, next);
    }

    // Escape regex special characters for safe search
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    const formulas = await Formula.find({
      $or: [
        { title: regex },
        { formula: regex },
        { description: regex },
        { topic: regex },
        { topicId: regex },
        { subtopic: regex },
        { tags: regex },
      ],
    })
      .sort({ title: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: formulas.length,
      data: formulas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get formulas by Topic
 * @route   GET /api/formulas/topic/:topic
 */
export const getFormulasByTopic = async (req, res, next) => {
  try {
    const { topic } = req.params;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic parameter is required',
      });
    }

    const escapedTopic = topic.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedTopic}$`, 'i');

    const formulas = await Formula.find({
      $or: [{ topic: regex }, { topicId: regex }],
    })
      .sort({ subtopic: 1, title: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: formulas.length,
      data: formulas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get formulas by Subtopic
 * @route   GET /api/formulas/subtopic/:subtopic
 */
export const getFormulasBySubtopic = async (req, res, next) => {
  try {
    const { subtopic } = req.params;
    if (!subtopic || typeof subtopic !== 'string' || !subtopic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subtopic parameter is required',
      });
    }

    const escapedSubtopic = subtopic.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedSubtopic}$`, 'i');

    const formulas = await Formula.find({ subtopic: regex })
      .sort({ title: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: formulas.length,
      data: formulas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single formula by ID
 * @route   GET /api/formulas/:id
 */
export const getFormulaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Formula ID is required',
      });
    }

    // Check if ID is a valid 24-character Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${id}`,
      });
    }

    const formula = await Formula.findById(id).lean();

    if (!formula) {
      return res.status(404).json({
        success: false,
        message: `Formula not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: formula,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new formula
 * @route   POST /api/formulas
 */
export const createFormula = async (req, res, next) => {
  try {
    const { topicId, topic, subtopic, title, formula, description, example, tags } = req.body;

    // Strict validation
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required and must be a non-empty string',
      });
    }

    if (!subtopic || typeof subtopic !== 'string' || !subtopic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subtopic is required and must be a non-empty string',
      });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Formula title is required and must be a non-empty string',
      });
    }

    if (!formula || typeof formula !== 'string' || !formula.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Formula expression is required and must be a non-empty string',
      });
    }

    const newFormula = await Formula.create({
      topicId: typeof topicId === 'string' ? topicId.trim() : '',
      topic: topic.trim(),
      subtopic: subtopic.trim(),
      title: title.trim(),
      formula: formula.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      example: typeof example === 'string' ? example.trim() : '',
      tags: Array.isArray(tags) ? tags.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim()) : [],
    });

    res.status(201).json({
      success: true,
      data: newFormula,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a formula by ID
 * @route   PUT /api/formulas/:id
 */
export const updateFormula = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${id}`,
      });
    }

    const { topicId, topic, subtopic, title, formula, description, example, tags } = req.body;

    const updateData = {};
    if (topicId !== undefined) updateData.topicId = String(topicId).trim();
    if (topic !== undefined) {
      if (typeof topic !== 'string' || !topic.trim()) {
        return res.status(400).json({ success: false, message: 'Topic cannot be empty' });
      }
      updateData.topic = topic.trim();
    }
    if (subtopic !== undefined) {
      if (typeof subtopic !== 'string' || !subtopic.trim()) {
        return res.status(400).json({ success: false, message: 'Subtopic cannot be empty' });
      }
      updateData.subtopic = subtopic.trim();
    }
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      updateData.title = title.trim();
    }
    if (formula !== undefined) {
      if (typeof formula !== 'string' || !formula.trim()) {
        return res.status(400).json({ success: false, message: 'Formula expression cannot be empty' });
      }
      updateData.formula = formula.trim();
    }
    if (description !== undefined) updateData.description = String(description).trim();
    if (example !== undefined) updateData.example = String(example).trim();
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim()) : [];
    }

    const updated = await Formula.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Formula not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a formula by ID
 * @route   DELETE /api/formulas/:id
 */
export const deleteFormula = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${id}`,
      });
    }

    const deleted = await Formula.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Formula not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Formula deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

