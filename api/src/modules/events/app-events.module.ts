import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportProgressHandler } from 'modules/events/import-data/import-progress.handler';
import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';
import { WebSocketsModule } from 'modules/notifications/websockets/websockets.module';
import { ImportProgressSocket } from 'modules/events/import-data/import-progress.socket';

@Global()
@Module({
  imports: [CqrsModule, WebSocketsModule],
  providers: [
    ImportProgressHandler,
    ImportProgressEmitter,
    ImportProgressSocket,
  ],
  exports: [ImportProgressEmitter],
})
export class AppEventsModule {}
