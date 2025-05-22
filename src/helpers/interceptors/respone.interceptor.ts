import { Reflector } from '@nestjs/core';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse<Response>();
    const responseMessage = this.reflector.get<string>('message', context.getHandler()) ?? '';
    return next.handle().pipe(
      map(data => {
        return {
          isSuccess: true,
          data: data,
          statusCode: response.statusCode,
          message: responseMessage ?? '',
        };
      }),
    );
  }
}

@Injectable()
export class MessageResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map(data => {
        return {
          isSuccess: true,
          statusCode: response.statusCode,
          message: data,
        };
      }),
    );
  }
}
