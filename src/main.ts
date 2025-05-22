import { ValidationPipe } from '@nestjs/common';
import { NestFactory, NestApplication } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MyHttpExceptionFilter } from './helpers/errors/exception';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { SwaggerUIExtended } from './swagger-ui';
import * as session from 'express-session';
import * as dotenv from 'dotenv';
import * as express from 'express';

dotenv.config();

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const APP_PORT = configService.get<string>('PORT');
  const SESSION_SECRET = configService.get<string>('SESSION_SECRET');

  const session_instance = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  });

  const validation_pipe_instance = new ValidationPipe({
    whitelist: true,
    transform: true,
  });

  app.enableCors();

  app.use(cookieParser());
  app.use(session_instance);
  app.use('/assets/images', express.static('assets/images'));
  app.use('/assets/qr', express.static('assets/qr'));
  app.use('/assets/portfolios', express.static('assets/portfolios'));
  app.use('/assets/videos', express.static('assets/videos'));
  app.useGlobalPipes(validation_pipe_instance);
  app.useGlobalFilters(new MyHttpExceptionFilter());

  new SwaggerUIExtended(app).create();

  const port = parseInt(APP_PORT) || 2586;
  await app.listen(port);
}
bootstrap();
