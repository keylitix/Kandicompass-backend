import { Module, Logger } from '@nestjs/common';
import { BeadsController } from './bead.controller';
import { BeadsService } from './bead.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Bead, BeadSchema } from '../../models/bead.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bead.name, schema: BeadSchema }])],
  controllers: [BeadsController],
  providers: [BeadsService, Logger],
})
export class BeadsModule {}
