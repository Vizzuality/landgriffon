/**
 * @description enum for claim based auth, with actions that a user / role (decide) can do
 */

export enum PERMISSIONS {
  CAN_CREATE_SCENARIO = 'canCreateScenario',
  CAN_EDIT_SCENARIO = 'canEditScenario',
  CAN_DELETE_SCENARIO = 'canDeleteScenario',
  // TODO: define a wide and clear list of claims
}
