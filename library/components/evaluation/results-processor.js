// Results Processor - Standardize for Metrics
// GitHub: https://raw.githubusercontent.com/Uptax-creator/N8N-Research-Agents/clean-deployment/code/processors/results-processor.js

const checkerResults = $('Evaluation Checker').item.json;

// Standardized results format
const processedResults = {
  // Main metrics (boolean values ready for .toNumber())
  config_loaded: checkerResults.config_loaded,
  performance_ok: checkerResults.performance_ok,
  ssv_created: checkerResults.ssv_created,
  github_connectivity: checkerResults.github_connectivity,

  // Metadata
  session_id: checkerResults.session_details?.session_id || `processed_${Date.now()}`,
  agent_id: checkerResults.session_details?.agent_id || 'unknown',
  query: checkerResults.session_details?.query || 'unknown',
  timestamp: new Date().toISOString(),

  // Performance data
  performance: {
    duration_ms: checkerResults.performance?.duration_ms || 0,
    under_5s: checkerResults.performance_ok,
    start_time: checkerResults.performance?.start_time,
    end_time: checkerResults.performance?.end_time
  },

  // Processing metadata
  processing: {
    processed_at: new Date().toISOString(),
    processor_version: '1.0.0',
    ready_for_metrics: true,
    github_loaded: true
  },

  // Raw data preserved for debugging
  raw_checker_data: checkerResults
};

console.log('⚙️ [Results Processor] GitHub Loaded & Processed:', {
  config_loaded: processedResults.config_loaded,
  performance_ok: processedResults.performance_ok,
  ssv_created: processedResults.ssv_created,
  github_connectivity: processedResults.github_connectivity,
  session_id: processedResults.session_id
});

return [{ json: processedResults }];