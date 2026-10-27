import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Users } from '../entities/user.entity';
import { ROLES_KEY } from './roles.decorator';

/**
 * Checks the caller's current role in the DB (not the token), so demoting or
 * deactivating a user takes effect immediately. Run after JwtAuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { userId?: number | string };
    }>();
    const raw = request.user?.userId;
    const userId = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    if (userId == null || Number.isNaN(userId)) {
      throw new UnauthorizedException('Missing authenticated user');
    }

    const user = await this.dataSource
      .getRepository(Users)
      .findOne({ where: { id: userId }, select: ['id', 'role', 'status'] });
    if (!user || !user.status) {
      throw new ForbiddenException('Account is inactive');
    }
    if (!required.includes(user.role)) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
