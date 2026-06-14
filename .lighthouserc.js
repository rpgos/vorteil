/** @type {import('@lhci/cli').LhciConfig} */
module.exports = {
  ci: {
    collect: {
      // Start the production server and audit these paths
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'started server',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:3000/en', 'http://localhost:3000/en/leagues'],
      numberOfRuns: 1,
    },
    assert: {
      // Informational thresholds only — tighten these as the app matures
      assertions: {
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:performance': ['warn', { minScore: 0.5 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
