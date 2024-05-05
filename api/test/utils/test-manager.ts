import { DataSource } from 'typeorm';
import ApplicationManager, { TestApplication } from './application-manager';
import { clearTestDataFromDatabase } from './database-test-helper';
import { setupTestUser } from './userAuth';
import * as request from 'supertest';
import { generateRandomName } from './generate-random-name';
import { TestingModuleBuilder } from '@nestjs/testing/testing-module.builder';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

export class TestManager {
  testApp: TestApplication;
  jwtToken: string;
  dataSource: DataSource;
  response?: request.Response;

  constructor(app: TestApplication, jwtToken: string, dataSource: DataSource) {
    this.testApp = app;
    this.jwtToken = jwtToken;
    this.dataSource = dataSource;
  }

  static async load(manager: any, testingModuleBuilder?: TestingModuleBuilder) {
    return new manager(await this.createManager(testingModuleBuilder));
  }

  static buildCustomTestModule(): TestingModuleBuilder {
    return Test.createTestingModule({ imports: [AppModule] });
  }

  static async createManager(testingModuleBuilder?: TestingModuleBuilder) {
    const testApplication = await ApplicationManager.init(testingModuleBuilder);
    const dataSource = testApplication.get<DataSource>(DataSource);
    const { jwtToken } = await setupTestUser(testApplication);
    return new TestManager(testApplication, jwtToken, dataSource);
  }

  async refreshState() {
    const { jwtToken } = await setupTestUser(this.testApp);
    this.jwtToken = jwtToken;
    this.response = undefined;
  }

  async clearDatabase() {
    await clearTestDataFromDatabase(this.dataSource);
  }

  async getRequest(options: { url: string; query?: object | string }) {
    this.response = await request(this.testApp.getHttpServer())
      .get(options.url)
      .query(options?.query || '')
      .set('Authorization', `Bearer ${this.token}`);
    return this.response;
  }

  get token() {
    if (!this.jwtToken) {
      throw new Error('TestManager has no token available!');
    }
    return this.jwtToken;
  }

  async close() {
    await this.testApp.close();
  }

  generateRandomName(): string {
    return generateRandomName();
  }
}
