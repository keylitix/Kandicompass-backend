import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestApplication } from '@nestjs/core';

export class SwaggerUIExtended {
  private readonly APP: NestApplication | null;

  private readonly config = new DocumentBuilder()
    .setTitle("Kandi_Backend API'S")
    .setDescription('kandi-backend app api')
    .setVersion('1.0')
    .build();

  private readonly swagger_design = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'kandi-backend live app apis',
  };

  constructor(app: NestApplication) {
    this.APP = app;
  }
  public create(): void | never {
    const document = SwaggerModule.createDocument(this.APP, this.config);
    SwaggerModule.setup('api', this.APP, document, this.swagger_design);
  }
}
