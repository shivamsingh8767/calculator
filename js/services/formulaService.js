/**
 * MATH/OS - Formula Data Access Service
 * 
 * Centralized service module for Formula queries.
 * Integrates with Node.js / Express REST API with seamless local dataset fallback.
 */

import { apiRequest } from './api.js';
import { FORMULAS_DATA } from '../formula-data.js';

export const FormulaService = {
  /**
   * Fetches all formulas from Express API or local fallback.
   * @returns {Promise<{ success: boolean, data: Array, count: number, source: 'api'|'local' }>}
   */
  async getAllFormulas() {
    const res = await apiRequest('/formulas');

    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      return {
        success: true,
        data: res.data,
        count: res.data.length,
        source: 'api',
      };
    }

    // Local fallback
    return {
      success: true,
      data: FORMULAS_DATA,
      count: FORMULAS_DATA.length,
      source: 'local',
    };
  },

  /**
   * Fetches a single formula by ID.
   * @param {string} id - Formula ID or Mongo ObjectId
   * @returns {Promise<{ success: boolean, data: Object|null, source: 'api'|'local' }>}
   */
  async getFormulaById(id) {
    if (!id) return { success: false, data: null, message: 'ID is required' };

    const res = await apiRequest(`/formulas/${encodeURIComponent(id)}`);

    if (res && res.success && res.data) {
      return {
        success: true,
        data: res.data,
        source: 'api',
      };
    }

    // Local fallback
    const localMatch = FORMULAS_DATA.find((f) => f.id === id || f._id === id);
    return {
      success: Boolean(localMatch),
      data: localMatch || null,
      source: 'local',
    };
  },

  /**
   * Searches formulas by query keyword.
   * @param {string} query - Keyword search term
   * @returns {Promise<{ success: boolean, data: Array, count: number, source: 'api'|'local' }>}
   */
  async searchFormulas(query) {
    const cleanQuery = (query || '').trim();

    if (!cleanQuery) {
      return this.getAllFormulas();
    }

    const res = await apiRequest(`/formulas/search?q=${encodeURIComponent(cleanQuery)}`);

    if (res && res.success && Array.isArray(res.data)) {
      return {
        success: true,
        data: res.data,
        count: res.data.length,
        source: 'api',
      };
    }

    // Local fallback multi-keyword search
    const terms = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const localFiltered = FORMULAS_DATA.filter((item) => {
      const combined = [
        item.title,
        item.formula,
        item.description,
        item.topic,
        item.subtopic,
        ...(item.tags || []),
      ].join(' ').toLowerCase();

      return terms.every((t) => combined.includes(t));
    });

    return {
      success: true,
      data: localFiltered,
      count: localFiltered.length,
      source: 'local',
    };
  },

  /**
   * Fetches formulas by Topic.
   * @param {string} topic - Topic name (e.g. 'Algebra', 'Trigonometry')
   * @returns {Promise<{ success: boolean, data: Array, count: number, source: 'api'|'local' }>}
   */
  async getFormulasByTopic(topic) {
    if (!topic) return this.getAllFormulas();

    const res = await apiRequest(`/formulas/topic/${encodeURIComponent(topic)}`);

    if (res && res.success && Array.isArray(res.data)) {
      return {
        success: true,
        data: res.data,
        count: res.data.length,
        source: 'api',
      };
    }

    // Local fallback
    const localFiltered = FORMULAS_DATA.filter(
      (f) => (f.topic || '').toLowerCase() === topic.toLowerCase() || (f.topicId || '').toLowerCase() === topic.toLowerCase()
    );

    return {
      success: true,
      data: localFiltered,
      count: localFiltered.length,
      source: 'local',
    };
  },

  /**
   * Fetches formulas by Subtopic.
   * @param {string} subtopic - Subtopic name (e.g. 'Quadratic Equations')
   * @returns {Promise<{ success: boolean, data: Array, count: number, source: 'api'|'local' }>}
   */
  async getFormulasBySubtopic(subtopic) {
    if (!subtopic) return this.getAllFormulas();

    const res = await apiRequest(`/formulas/subtopic/${encodeURIComponent(subtopic)}`);

    if (res && res.success && Array.isArray(res.data)) {
      return {
        success: true,
        data: res.data,
        count: res.data.length,
        source: 'api',
      };
    }

    // Local fallback
    const localFiltered = FORMULAS_DATA.filter(
      (f) => (f.subtopic || '').toLowerCase() === subtopic.toLowerCase()
    );

    return {
      success: true,
      data: localFiltered,
      count: localFiltered.length,
      source: 'local',
    };
  },
};

// Top-level function exports
export const getAllFormulas = FormulaService.getAllFormulas.bind(FormulaService);
export const getFormulaById = FormulaService.getFormulaById.bind(FormulaService);
export const searchFormulas = FormulaService.searchFormulas.bind(FormulaService);
export const getFormulasByTopic = FormulaService.getFormulasByTopic.bind(FormulaService);
export const getFormulasBySubtopic = FormulaService.getFormulasBySubtopic.bind(FormulaService);
