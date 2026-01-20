import { ForbiddenException, Logger } from '@nestjs/common';
import { AdminRole, UserRole } from 'generated/prisma';

import { GetUserType } from './types';

/**
 * Checks row-level permissions based on user roles or UID
 * @param user - the authenticated user object
 * @param requestedId - the ID(s) being requested for permission check
 * @param roles - roles that bypass row-level checks (default: ['ADMIN', 'SUPER_ADMIN'])
 * @returns boolean - whether the user is authorized
 */
export const checkRowLevelPermission = (
  user: GetUserType,
  requestedId?: string | string[],
  roles: (AdminRole | UserRole)[] = ['ADMIN', 'USER'],
): boolean => {
  const userRole = user.roles;

  // If there's no requested ID, permission is denied by default
  if (!requestedId) {
    Logger.warn(
      `User ${user.uid} attempted access without specifying a target ID.`,
    );
    return false;
  }

  // Check if the user has any of the roles that bypass UID checks
  if (userRole.some((role) => roles.includes(role))) {
    return true; // Allow access based on role
  }

  // If requestedId is a single string, convert it to an array
  const ids =
    typeof requestedId === 'string'
      ? [requestedId]
      : requestedId.filter(Boolean);

  // Deny access if no valid UIDs are provided
  if (ids.length === 0) {
    Logger.warn(
      `User ${user.uid} attempted access with an empty or invalid ID list.`,
    );
    return false;
  }

  // Check if the user's ID matches the requested UID(s)
  if (!ids.includes(user.uid)) {
    Logger.warn(
      `User ${user.uid} denied access to resource(s) belonging to UIDs: ${ids.join(', ')}`,
    );
    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }

  return true; // Allow access if UID matches
};

export const removeProperties = (
  obj: Record<string, unknown>,
  properties: string[],
) => {
  if (!obj || typeof obj !== 'object') {
    throw new Error('The first argument must be an object.');
  }
  if (!Array.isArray(properties)) {
    throw new Error('The second argument must be an array.');
  }

  const result = { ...obj }; // Create a shallow copy to avoid mutating the original object
  properties.forEach((prop) => {
    delete result[prop];
  });

  return result;
};
