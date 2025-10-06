/**
 * N8N Data Tables CRUD Component
 *
 * Operações seguras de CRUD para N8N Data Tables com:
 * - Validação de inputs
 * - Sanitização de dados
 * - Suporte a multi-tenancy
 * - Operações: INSERT, UPDATE, DELETE, GET, UPSERT
 *
 * GitHub: https://github.com/Uptax-creator/N8N-Research-Agents
 * Branch: clean-deployment
 * Path: N8N/code/processors/data-table-crud.js
 *
 * @version 1.0.0
 * @requires data-table-helper-enhanced.js
 */

class DataTableCRUD {
  constructor(helper) {
    if (!helper) {
      throw new Error('DataTableHelper instance is required');
    }
    this.helper = helper;
    this.allowedTables = ['projects', 'agents', 'wrk_execution', 'wrk_state', 'wrk_variables'];
    this.allowedOperations = ['INSERT', 'UPDATE', 'DELETE', 'GET', 'UPSERT'];
  }

  /**
   * Valida operação e tabela
   */
  validateRequest(operation, tableName) {
    if (!this.allowedOperations.includes(operation.toUpperCase())) {
      throw new Error(`Invalid operation: ${operation}. Allowed: ${this.allowedOperations.join(', ')}`);
    }

    if (!this.allowedTables.includes(tableName)) {
      throw new Error(`Invalid table: ${tableName}. Allowed: ${this.allowedTables.join(', ')}`);
    }
  }

  /**
   * Sanitiza dados de entrada
   */
  sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object');
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Remove propriedades perigosas
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        continue;
      }

      // Sanitiza strings
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * INSERT - Insere novo registro
   */
  async insert(tableName, data, options = {}) {
    this.validateRequest('INSERT', tableName);
    const sanitizedData = this.sanitizeData(data);

    const result = await this.helper.insert(tableName, sanitizedData, {
      validateFK: options.validateFK !== false,
      fkChecks: options.fkChecks || []
    });

    return {
      success: true,
      operation: 'INSERT',
      table: tableName,
      result: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * UPDATE - Atualiza registro existente
   */
  async update(tableName, filter, updates, options = {}) {
    this.validateRequest('UPDATE', tableName);

    if (!filter || Object.keys(filter).length === 0) {
      throw new Error('Filter is required for UPDATE operation');
    }

    const sanitizedUpdates = this.sanitizeData(updates);

    const result = await this.helper.update(tableName, filter, sanitizedUpdates, {
      validateFK: options.validateFK !== false
    });

    return {
      success: true,
      operation: 'UPDATE',
      table: tableName,
      result: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * DELETE - Remove registro
   */
  async delete(tableName, filter, options = {}) {
    this.validateRequest('DELETE', tableName);

    if (!filter || Object.keys(filter).length === 0) {
      throw new Error('Filter is required for DELETE operation');
    }

    const result = await this.helper.deleteWhere(tableName, filter);

    return {
      success: true,
      operation: 'DELETE',
      table: tableName,
      result: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GET - Busca registros
   */
  async get(tableName, filter = {}, options = {}) {
    this.validateRequest('GET', tableName);

    const result = await this.helper.get(tableName, filter, {
      includeIsolation: options.includeIsolation !== false
    });

    return {
      success: true,
      operation: 'GET',
      table: tableName,
      count: result.length,
      result: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * UPSERT - Insere ou atualiza
   */
  async upsert(tableName, uniqueFields, data, options = {}) {
    this.validateRequest('UPSERT', tableName);

    if (!uniqueFields || Object.keys(uniqueFields).length === 0) {
      throw new Error('Unique fields are required for UPSERT operation');
    }

    const sanitizedData = this.sanitizeData(data);

    // Verifica se registro existe
    const existing = await this.helper.get(tableName, uniqueFields);

    let result;
    let operation;

    if (existing.length > 0) {
      // UPDATE
      result = await this.helper.update(tableName, uniqueFields, sanitizedData, {
        validateFK: options.validateFK !== false
      });
      operation = 'UPDATED';
    } else {
      // INSERT
      const fullData = { ...uniqueFields, ...sanitizedData };
      result = await this.helper.insert(tableName, fullData, {
        validateFK: options.validateFK !== false,
        fkChecks: options.fkChecks || []
      });
      operation = 'INSERTED';
    }

    return {
      success: true,
      operation: 'UPSERT',
      action: operation,
      table: tableName,
      result: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executa operação dinâmica baseada em request
   */
  async execute(request) {
    const { operation, table, data, filter, uniqueFields, options } = request;

    if (!operation || !table) {
      throw new Error('Operation and table are required');
    }

    const op = operation.toUpperCase();

    switch (op) {
      case 'INSERT':
        return await this.insert(table, data, options);

      case 'UPDATE':
        return await this.update(table, filter, data, options);

      case 'DELETE':
        return await this.delete(table, filter, options);

      case 'GET':
        return await this.get(table, filter, options);

      case 'UPSERT':
        return await this.upsert(table, uniqueFields, data, options);

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  /**
   * Batch operations - executa múltiplas operações em sequência
   */
  async executeBatch(requests) {
    if (!Array.isArray(requests)) {
      throw new Error('Requests must be an array');
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < requests.length; i++) {
      try {
        const result = await this.execute(requests[i]);
        results.push({
          index: i,
          success: true,
          result: result
        });
      } catch (error) {
        errors.push({
          index: i,
          success: false,
          error: error.message,
          request: requests[i]
        });
      }
    }

    return {
      success: errors.length === 0,
      total: requests.length,
      successful: results.length,
      failed: errors.length,
      results: results,
      errors: errors,
      timestamp: new Date().toISOString()
    };
  }
}

// Export para N8N
module.exports = DataTableCRUD;
