import { Module, Logger } from '@nestjs/common';
import { BeadsController } from './bead.controller';
import { BeadsService } from './bead.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Bead, BeadSchema } from '../../models/bead.schema';
import { Thread, ThreadSchema } from '@app/models/thread.schema';
import { FeedModule } from '../feed/feed.module';
import { User, UserSchema } from '@app/models/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bead.name, schema: BeadSchema },
      { name: Thread.name, schema: ThreadSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FeedModule,
  ],
  controllers: [BeadsController],
  providers: [BeadsService, Logger],
})
export class BeadsModule {}
