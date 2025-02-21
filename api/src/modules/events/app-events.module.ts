import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WebSocketsModule } from 'modules/notifications/websockets/websockets.module';
import { ImportProgressSocket } from 'modules/events/import-data-progress/import-progress.socket';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [CqrsModule, WebSocketsModule, CacheModule.register()], /// Might be problematic
  providers: [ImportProgressSocket],
  exports: [ImportProgressSocket, CqrsModule],
})
export class AppEventsModule {}
