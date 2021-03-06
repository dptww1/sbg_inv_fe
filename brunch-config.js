module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/,
        'app.js': /^app/
      }
    },
    stylesheets: {joinTo: 'app.css'}
  },

  plugins: {
    babel: {presets: ['es2015']}
  },

  overrides: {
    production: {
      optimize: true,
      sourceMaps: true,
      plugins: {
        autoReload: {enabled: false},
        off: ['autoReload']
      }
    }
  }
};
