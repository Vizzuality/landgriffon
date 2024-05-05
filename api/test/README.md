# Testing Approach for LandGriffon

This document describes the testing approach for LandGriffon. The testing approach is divided into two parts.

## Aim

We aim to improve the way we write tests in our app, especially e2e tests. Most of the time, we need to create several
preconditions in the DB before we can actually test the feature. This is a problem because it makes the tests not very
readable and also there is a lot of duplicated code.

We aim to slowly transition to encapsulate all tests using some sort of Gherkin syntax. This will provide a better
understanding of what is being tested and also help to avoid duplicated code.

## TestManager Class

We have a base `TestManager` class, which encapsulates most of the common logic needed for tests. The testing app is
injected in the class and implements several methods for loading it, making requests, teardown the app, and clean the
DB.

## Test Execution

For specific precondition generation (ARRANGE), execution (ACT), and assertions (ASSERT), we have a class for each
feature, module, or concept. This class extends the `TestManager` class and implements the specific methods for that
feature. We are slowly transitioning to this approach.

Example:

```typescript
describe('GeoRegions Filters (e2e)', () => {
	let testManager: EUDRTestManager;

	beforeAll(async () => {
		testManager = await TestManager.load(EUDRTestManager);
	});
	beforeEach(async () => {
		await testManager.refreshState();
	});

	afterEach(async () => {
		await testManager.clearDatabase();
	});

	afterAll(async () => {
		await testManager.close();
	});
```
