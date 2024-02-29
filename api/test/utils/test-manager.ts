import { DataSource } from 'typeorm';
import ApplicationManager, { TestApplication } from './application-manager';
import { clearTestDataFromDatabase } from './database-test-helper';
import { setupTestUser } from './userAuth';
import * as request from 'supertest';
import {
  createGeoRegion,
  createMaterial,
  createSupplier,
} from '../entity-mocks';
import { Material } from 'modules/materials/material.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { randomName } from './random-name';

export class TestManager {
  testApp: TestApplication;
  jwtToken: string;
  dataSource: DataSource;
  response?: request.Response;
  materials?: Material[];
  suppliers?: Supplier[];
  geoRegions?: GeoRegion[];

  constructor(app: TestApplication, jwtToken: string, dataSource: DataSource) {
    this.testApp = app;
    this.jwtToken = jwtToken;
    this.dataSource = dataSource;
  }

  static async createManager() {
    const testApplication = await ApplicationManager.init();
    const dataSource = testApplication.get<DataSource>(DataSource);
    const { jwtToken } = await setupTestUser(testApplication);
    return new TestManager(testApplication, jwtToken, dataSource);
  }

  async refreshState() {
    const { jwtToken } = await setupTestUser(this.testApp);
    this.jwtToken = jwtToken;
    this.materials = undefined;
    this.suppliers = undefined;
    this.geoRegions = undefined;
    this.response = undefined;
  }

  async clearDatabase() {
    await clearTestDataFromDatabase(this.dataSource);
  }

  async GET(options: { url: string; query?: object | string }) {
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

  async createMaterials(names?: string[]) {
    const namesToCreate = names || [randomName()];
    const createdMaterials: Material[] = [];
    for (let i = 0; i < namesToCreate.length; i++) {
      createdMaterials.push(await createMaterial({ name: namesToCreate[i] }));
    }
    this.materials?.push(...createdMaterials);
    return createdMaterials;
  }

  async createSuppliers(names?: string[]) {
    const namesToCreate = names || [randomName()];
    const createdSuppliers: Supplier[] = [];
    for (let i = 0; i < namesToCreate.length; i++) {
      createdSuppliers.push(await createSupplier({ name: namesToCreate[i] }));
    }
    this.suppliers?.push(...createdSuppliers);
    return createdSuppliers;
  }

  async createGeoRegions(names?: string[]) {
    const namesToCreate = names || [randomName()];
    const createdGeoRegions: GeoRegion[] = [];
    for (let i = 0; i < namesToCreate.length; i++) {
      createdGeoRegions.push(await createGeoRegion({ name: namesToCreate[i] }));
    }
    this.geoRegions?.push(...createdGeoRegions);
    return createdGeoRegions;
  }
}
