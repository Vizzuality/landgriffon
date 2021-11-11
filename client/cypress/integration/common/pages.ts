/// <reference types="cypress" />
import { Given, Then } from 'cypress-cucumber-preprocessor/steps';

beforeEach(() => cy.viewport(1280, 720));
Given('I am on the landing page', () => {
  cy.visit('http://localhost:3000/analysis');
});

Given('I am on the sign-in page', () => {
  cy.visit('http://localhost:3000/auth/sign-in');
});

Then('I navigate to {string} page', (page: string) => {
  cy.url().should('include', page);
});
