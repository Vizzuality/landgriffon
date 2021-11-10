import { When } from "cypress-cucumber-preprocessor/steps";
import {forms} from "../page-objects/forms";

When('I submit on the {string} form', (form: string)=>{
  cy.get(`${forms[form]} #email`).type('anyemail@anydomain.any');
  cy.get(`${forms[form]} #password`).type('anypass');
  cy.get(forms[form]).submit();
});
