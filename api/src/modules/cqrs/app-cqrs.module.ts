import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportProgressHandler } from 'modules/cqrs/import-data/import-progress.handler';
import { ImportProgressService } from 'modules/cqrs/import-data/import-progress.service';
import { WebSocketsModule } from 'modules/notifications/websockets/websockets.module';

@Global()
@Module({
  imports: [CqrsModule, WebSocketsModule],
  providers: [ImportProgressHandler, ImportProgressService],
  exports: [ImportProgressService],
})
export class AppCqrsModule {}
