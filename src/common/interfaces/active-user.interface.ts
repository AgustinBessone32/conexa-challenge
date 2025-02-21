import { Role } from '@prisma/client';

export interface UserActiveInterface {
  email: string;
  role: Role;
}
