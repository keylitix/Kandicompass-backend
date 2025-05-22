import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

@Injectable()
export class MongoDBConnectionService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  public createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get<string>('MONGO_URI'),
      retryAttempts: 5,
      retryDelay: 5,
    };
  }
}

export const db1 = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useClass: MongoDBConnectionService,
});
