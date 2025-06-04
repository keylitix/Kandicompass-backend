import { Module, Logger } from '@nestjs/common';
import { ThreadsController } from './thread.controller';
import { ThreadsService } from './thread.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Thread, ThreadSchema } from '../../models/thread.schema';
import { BeadsModule } from '../bead/bead.module';
import { ThreadInviteSchema } from '@app/models/invite.schema';
import { User, UserSchema } from '@app/models/user.schema';
import { BeadPurchaseRequest, BeadPurchaseRequestSchema } from '@app/models/beadPurchaseRequest.schema';
import { Bead, BeadSchema } from '@app/models/bead.schema';
import { MembershipRequest, MembershipRequestSchema } from '@app/models/membershipRequest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: 'ThreadInvite', schema: ThreadInviteSchema },
      { name: User.name, schema: UserSchema },
      { name: Bead.name, schema: BeadSchema },
      { name: BeadPurchaseRequest.name, schema: BeadPurchaseRequestSchema },
      { name: MembershipRequest.name, schema: MembershipRequestSchema },
    ]),
    BeadsModule,
  ],
  controllers: [ThreadsController],
  providers: [ThreadsService, Logger],
})
export class ThreadsModule {}
