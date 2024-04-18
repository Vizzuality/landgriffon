import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportProgressHandler } from 'modules/cqrs/import-data/import-progress.handler';
import { ImportProgressEmitter } from 'modules/cqrs/import-data/import-progress.emitter';
import { WebSocketsModule } from 'modules/notifications/websockets/websockets.module';

@Global()
@Module({
  imports: [CqrsModule, WebSocketsModule],
  providers: [ImportProgressHandler, ImportProgressEmitter],
  exports: [ImportProgressEmitter],
})
export class AppCqrsModule {}
