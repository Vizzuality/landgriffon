/// <reference types="cypress" />


// report-test.spec.ts created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

/**
 * @debt: This is a dumb test just to run through the actual FE code and generate a non-empty report
 * to avoid a failing CI stage (uploading report to Code-Climate)
 *
 * Delete this suite as soon as you generate an actual unit/integration/e2e test
 */

// @ts-ignore
describe('Dumb test to generate report', ()=> {
  it('Should pass to generate a minimum report to pass CI stage', ()=>{
    cy.visit('http://localhost:3000')
    cy.get('h1').contains('Vizzuality')
  })
  }
)
