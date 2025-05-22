import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request.headers);

    if (!token) {
      this.logger.error('Token not found');
      throw new UnauthorizedException('Token is required');
    }

    try {
      const decoded = this.jwtService.verify(token);
      this.logger.log('Decoded token:', decoded);
      if (!decoded._id) {
        throw new UnauthorizedException('Invalid token: _id not found');
      }
      request['user'] = decoded;
      return true;
    } catch (err) {
      this.logger.error('Token verification error', err.message || err);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(headers: Record<string, any>): string | null {
    const token = headers['x-access-token'] || headers['authorization']?.replace('Bearer ', '') || null;
    return token;
  }
}
