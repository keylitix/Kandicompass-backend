import { Module, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { db1 as databaseConnection } from '../connection/db';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/server.configuration';
import { UserModule } from './user/user.module';
import { BeadsModule } from './bead/bead.module';
import { ThreadsModule } from './thread/thread.module';
import { FeedModule } from './feed/feed.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
      expandVariables: true,
    }),
    databaseConnection,
    UserModule,
    BeadsModule,
    ThreadsModule,
    FeedModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
