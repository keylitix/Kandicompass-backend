import { Logger, Module, Global } from '@nestjs/common';
import { UserController } from './user.controller';
import { User } from '@app/models/user.schema';
import { UserSchema } from '@app/models/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: 'qwerty123456',
    }),
    // AddressModule,
  ],
  controllers: [UserController],
  providers: [UserService, Logger], // Make sure UsersService is part of providers
  exports: [UserService],
})
export class UserModule {}
