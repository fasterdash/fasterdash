module.exports = {
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "node": "current"
      },
      "modules": "auto"  // This allows Babel to transform ES modules to CommonJS if needed
    }]
  ]
}
