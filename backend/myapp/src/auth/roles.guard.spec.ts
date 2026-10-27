import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function ctx(user?: { userId?: number }): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function guard(
  required: string[] | undefined,
  dbUser: { role: string; status: boolean } | null,
) {
  const reflector = {
    getAllAndOverride: () => required,
  } as unknown as Reflector;
  const dataSource = {
    getRepository: () => ({ findOne: jest.fn().mockResolvedValue(dbUser) }),
  };
  return new RolesGuard(reflector, dataSource as never);
}

describe('RolesGuard', () => {
  it('allows routes without a role requirement', async () => {
    await expect(guard(undefined, null).canActivate(ctx())).resolves.toBe(true);
  });

  it('allows an active admin', async () => {
    const g = guard(['admin'], { role: 'admin', status: true });
    await expect(g.canActivate(ctx({ userId: 1 }))).resolves.toBe(true);
  });

  it('rejects a shopper', async () => {
    const g = guard(['admin'], { role: 'user', status: true });
    await expect(g.canActivate(ctx({ userId: 2 }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects a deactivated admin', async () => {
    const g = guard(['admin'], { role: 'admin', status: false });
    await expect(g.canActivate(ctx({ userId: 1 }))).rejects.toThrow(
      ForbiddenException,
    );
  });
});
