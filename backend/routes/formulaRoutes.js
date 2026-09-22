import express from 'express';
import {
  getAllFormulas,
  getFormulaById,
  searchFormulas,
  getFormulasByTopic,
  getFormulasBySubtopic,
  createFormula,
  updateFormula,
  deleteFormula,
} from '../controllers/formulaController.js';

const router = express.Router();

// Specific routes first to prevent collision with parameterised /:id
router.get('/search', searchFormulas);
router.get('/topic/:topic', getFormulasByTopic);
router.get('/subtopic/:subtopic', getFormulasBySubtopic);

// Collection routes
router.route('/')
  .get(getAllFormulas)
  .post(createFormula);

// Individual resource routes
router.route('/:id')
  .get(getFormulaById)
  .put(updateFormula)
  .delete(deleteFormula);

export default router;
