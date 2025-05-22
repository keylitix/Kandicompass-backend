import { Module, Logger } from '@nestjs/common';
import { ThreadsController } from './thread.controller';
import { ThreadsService } from './thread.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Thread, ThreadSchema } from '../../models/thread.schema';
import { BeadsModule } from '../bead/bead.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema }]), BeadsModule],
  controllers: [ThreadsController],
  providers: [ThreadsService, Logger],
})
export class ThreadsModule {}
