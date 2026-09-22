/**
 * MATH/OS - Calculation History Data Access Service
 * 
 * Communicates with Node.js / Express `/api/history` REST endpoints.
 * Handles graceful local fallback when the backend service is offline.
 */

import { apiRequest } from './api.js';

export const HistoryService = {
  /**
   * Saves a calculation record to the backend.
   * 
   * @param {Object} calculation
   * @param {string} calculation.expression
   * @param {string|number} calculation.result
   * @param {string} [calculation.formattedResult]
   * @param {'normal'|'scientific'} calculation.type
   * @param {'DEG'|'RAD'|null} [calculation.angleMode]
   * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
   */
  async saveCalculation(calculation) {
    if (!calculation || typeof calculation !== 'object') {
      return { success: false, message: 'Invalid calculation payload' };
    }

    const { expression, result, formattedResult, type, angleMode } = calculation;

    if (!expression || result === undefined || result === null) {
      return { success: false, message: 'Expression and result are required' };
    }

    const payload = {
      expression: String(expression).trim(),
      result: String(result).trim(),
      formattedResult: formattedResult ? String(formattedResult).trim() : String(result).trim(),
      type: (type || 'normal').toLowerCase(),
      angleMode: angleMode ? String(angleMode).toUpperCase() : null,
    };

    const res = await apiRequest('/history', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return res;
  },

  /**
   * Retrieves calculation history from backend.
   * @param {number} [limit=50] - Max records
   * @returns {Promise<{ success: boolean, data: Array, count: number }>}
   */
  async getCalculationHistory(limit = 50) {
    const res = await apiRequest(`/history?limit=${Math.min(limit, 200)}`);

    if (res && res.success && Array.isArray(res.data)) {
      return {
        success: true,
        data: res.data,
        count: res.data.length,
      };
    }

    return {
      success: false,
      data: [],
      count: 0,
      message: res.message || 'Unable to fetch history from server',
    };
  },

  /**
   * Retrieves a single calculation record by ID.
   * @param {string} id - Record ID
   * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
   */
  async getCalculationById(id) {
    if (!id) return { success: false, message: 'ID is required' };

    const res = await apiRequest(`/history/${encodeURIComponent(id)}`);
    return res;
  },

  /**
   * Deletes a single calculation record by ID.
   * @param {string} id - Record ID
   * @returns {Promise<{ success: boolean, message?: string }>}
   */
  async deleteCalculation(id) {
    if (!id) return { success: false, message: 'ID is required' };

    const res = await apiRequest(`/history/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    return res;
  },

  /**
   * Clears all calculation history records.
   * @returns {Promise<{ success: boolean, message?: string }>}
   */
  async clearCalculationHistory() {
    const res = await apiRequest('/history', {
      method: 'DELETE',
    });

    return res;
  },
};

// Top-level function exports
export const saveCalculation = HistoryService.saveCalculation.bind(HistoryService);
export const getCalculationHistory = HistoryService.getCalculationHistory.bind(HistoryService);
export const getCalculationById = HistoryService.getCalculationById.bind(HistoryService);
export const deleteCalculation = HistoryService.deleteCalculation.bind(HistoryService);
export const clearCalculationHistory = HistoryService.clearCalculationHistory.bind(HistoryService);
