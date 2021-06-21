/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
const browserify = require("@cypress/browserify-preprocessor");
const cucumber = require("cypress-cucumber-preprocessor").default;
const resolve = require("resolve");
module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)
  const options = {
    ...browserify.defaultOptions,
    typescript: resolve.sync("typescript", { baseDir: config.projectRoot }),
  };

  on("file:preprocessor", cucumber(options));
  // include any other plugin code...

  // It's IMPORTANT to return the config object
  // with any changed environment variables
  return config
};
