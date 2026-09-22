import express from 'express';
import {
  createHistory,
  getHistory,
  getHistoryById,
  deleteHistory,
  clearHistory,
} from '../controllers/historyController.js';

const router = express.Router();

// Collection routes
router.route('/')
  .post(createHistory)
  .get(getHistory)
  .delete(clearHistory);

// Individual resource routes
router.route('/:id')
  .get(getHistoryById)
  .delete(deleteHistory);

export default router;
