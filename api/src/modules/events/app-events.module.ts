import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportProgressHandler } from 'modules/events/import-data-progress/import-progress.handler';
import { ImportProgressEmitter } from 'modules/events/import-data-progress/import-progress.emitter';
import { WebSocketsModule } from 'modules/notifications/websockets/websockets.module';
import { ImportProgressSocket } from 'modules/events/import-data-progress/import-progress.socket';
import { ImportProgressTrackerFactory } from 'modules/events/import-data-progress/import-progress.tracker.factory';

@Global()
@Module({
  imports: [CqrsModule, WebSocketsModule],
  providers: [
    ImportProgressHandler,
    ImportProgressEmitter,
    ImportProgressSocket,
    ImportProgressTrackerFactory,
  ],
  exports: [
    ImportProgressEmitter,
    ImportProgressTrackerFactory,
    ImportProgressSocket,
    CqrsModule,
  ],
})
export class AppEventsModule {}
