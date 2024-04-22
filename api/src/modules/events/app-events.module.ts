import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportProgressHandler } from 'modules/events/import-data/import-progress.handler';
import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';
import { WebSocketsModule } from 'modules/notifications/websockets/websockets.module';
import { ImportProgressSocket } from 'modules/events/import-data/import-progress.socket';
import { ImportProgressTrackerFactory } from './import-data/import-progress.tracker.factory';

@Global()
@Module({
  imports: [CqrsModule, WebSocketsModule],
  providers: [
    ImportProgressHandler,
    ImportProgressEmitter,
    ImportProgressSocket,
    ImportProgressTrackerFactory,
  ],
  exports: [ImportProgressEmitter, ImportProgressTrackerFactory],
})
export class AppEventsModule {}
