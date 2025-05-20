import { Role } from '@app/common';
import { SetMetadata } from '@nestjs/common';

export const RBAC_KEY = 'roles';
export const RBAC = (...roles: Role[]) => SetMetadata(RBAC_KEY, roles);
