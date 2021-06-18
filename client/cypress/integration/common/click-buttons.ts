import { When } from "cypress-cucumber-preprocessor/steps";
import {buttons} from "../page-objects/nav-buttons";

When('I click on the sidebar {string} button', (button: string)=>{
  cy.get(buttons[button]).click()
})



