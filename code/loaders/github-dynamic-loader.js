// GitHub Dynamic Loader - Pattern for all nodes
// Use this pattern in N8N Code nodes for GitHub loading

async function loadFromGitHub(githubUrl, fallbackCode) {
  try {
    const response = await this.helpers.httpRequest({
      method: 'GET',
      url: githubUrl,
      timeout: 10000
    });

    const dynamicCode = response.data || response;
    const dynamicFunction = new Function('$', '$json', 'console', dynamicCode);
    const result = dynamicFunction($, $json, console);

    console.log('✅ GitHub code loaded successfully from:', githubUrl);
    return result;

  } catch (error) {
    console.log('⚠️ GitHub load failed, using fallback:', error.message);

    // Execute fallback code
    const fallbackFunction = new Function('$', '$json', 'console', fallbackCode);
    return fallbackFunction($, $json, console);
  }
}

// Export for reuse
return { loadFromGitHub };