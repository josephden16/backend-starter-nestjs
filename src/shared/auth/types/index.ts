import { UserRole } from 'generated/prisma';

export type GetUserType = {
  uid: string;
  roles: UserRole[];
};

export type AuthenticatedUser = {
  id: string;
  role: string;
};

export type AuthenticatedAdmin = {
  id: string;
  role: string;
};
