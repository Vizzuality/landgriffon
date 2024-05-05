import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import * as config from 'config';
import { AppModule } from 'app.module';
import { TestingModuleBuilder } from '@nestjs/testing/testing-module.builder';
import {
  ClassProvider,
  FactoryProvider,
  Type,
  ValueProvider,
} from '@nestjs/common/interfaces';
import { TestingModule } from '@nestjs/testing/testing-module';
import { isUndefined } from 'lodash';
import { MockAlertRepository, MockEmailService } from './service-mocks';
import { IEmailServiceToken } from '../../src/modules/notifications/notifications.module';

type Overrides = {
  classes: ClassProvider[];
  values: ValueProvider[];
  factories: FactoryProvider[];
};

export default class ApplicationManager {
  static readonly regenerateResourcesOnEachTest: boolean = false;
  static readonly defaultOverriders: Overrides = {
    classes: [
      { provide: IEmailServiceToken, useClass: MockEmailService },
      {
        provide: 'IEUDRAlertsRepository',
        useClass: MockAlertRepository,
      },
    ],
    values: [],
    factories: [],
  };

  static testApplication?: TestApplication;
  static isCustomApplication: boolean;

  static async init(
    initTestingModuleBuilder?: TestingModuleBuilder,
    skipAppInit: boolean = false,
  ): Promise<TestApplication> {
    if (ApplicationManager.isCustomApplication) {
      await ApplicationManager.tearDown();
    }

    if (
      !isUndefined(ApplicationManager.testApplication) &&
      isUndefined(initTestingModuleBuilder) &&
      !skipAppInit &&
      !ApplicationManager.isCustomApplication
    ) {
      return ApplicationManager.testApplication;
    }

    ApplicationManager.testApplication = new TestApplication();
    ApplicationManager.isCustomApplication =
      !isUndefined(initTestingModuleBuilder) || skipAppInit;

    const testingModuleBuilder: TestingModuleBuilder =
      initTestingModuleBuilder ||
      Test.createTestingModule({
        imports: [AppModule],
      });
    // TODO: modify this so the default overrrides can be overriden by the custom ones. Right now we are applying them to other custom that might come
    overrideProviders(
      testingModuleBuilder,
      ApplicationManager.defaultOverriders,
    );

    ApplicationManager.testApplication.moduleFixture =
      await testingModuleBuilder.compile();

    const serverConfig: any = config.get('server');
    ApplicationManager.testApplication.application =
      ApplicationManager.testApplication.moduleFixture.createNestApplication({
        logger: serverConfig.loggerLevel,
      });
    useContainer(
      ApplicationManager.testApplication.application.select(AppModule),
      {
        fallbackOnErrors: true,
      },
    );
    ApplicationManager.testApplication.application.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    const reflector: Reflector =
      ApplicationManager.testApplication.application.get(Reflector);
    ApplicationManager.testApplication.application.useGlobalGuards(
      new JwtAuthGuard(reflector),
    );

    if (!skipAppInit) {
      await ApplicationManager.testApplication.application.init();
    }

    return ApplicationManager.testApplication;
  }

  static async tearDown(): Promise<void> {
    if (!ApplicationManager.testApplication) {
      return;
    }
    await ApplicationManager.testApplication.application.close();
    await ApplicationManager.testApplication.moduleFixture.close();
    ApplicationManager.testApplication = undefined;
  }
}

export class TestApplication {
  application: INestApplication;
  moduleFixture: TestingModule;

  getHttpServer(): any {
    return this.application.getHttpServer();
  }

  get<TInput = any, TResult = TInput>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    typeOrToken: Type<TInput> | Function | string | symbol,
  ): TResult {
    return this.moduleFixture.get(typeOrToken);
  }

  async close(): Promise<void> {
    if (!ApplicationManager.regenerateResourcesOnEachTest) {
      return;
    }
    await this.moduleFixture.close();
    await this.application.close();
    ApplicationManager.testApplication = undefined;
  }
}

const overrideProviders = (
  module: TestingModuleBuilder,
  overrides: Overrides,
) => {
  const { classes, values, factories } = overrides;

  classes.forEach(({ provide, useClass }) =>
    module.overrideProvider(provide).useClass(useClass),
  );
  values.forEach(({ provide, useValue }) =>
    module.overrideProvider(provide).useValue(useValue),
  );
  factories.forEach(({ provide, useFactory }) =>
    module
      .overrideProvider(provide)
      .useFactory({ factory: (args) => useFactory(...args) }),
  );
};
