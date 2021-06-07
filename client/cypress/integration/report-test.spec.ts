/// <reference types="cypress" />
// report-test.spec.ts created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test


describe('Dumb test to generate report', ()=> {
  it('do nothing', ()=>{
    cy.visit('localhost:3000')
    cy.get('h1').contains('Welcome to Vizzuality')
  })
  }
)
