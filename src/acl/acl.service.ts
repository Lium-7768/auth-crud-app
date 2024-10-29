import { Injectable } from '@nestjs/common';
import { Role } from 'src/prisma/generated/client';

@Injectable()
export class AclService {
  private permissions = {
    [Role.ADMIN]: ['create', 'read', 'update', 'delete'],
    [Role.EDITOR]: ['create', 'read', 'update'],
    [Role.USER]: ['read'],
  };

  can(role: Role, action: string): boolean {
    return this.permissions[role].includes(action);
  }
}
