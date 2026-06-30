import { db } from '../db/db';
import { permissionsTable } from '../db/schema/permissions';
import { rolesTable } from '../db/schema/roles';
import { rolePermissionsTable } from '../db/schema/role-permisions';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

function getRequiredId(
  map: Record<string, string | undefined>,
  key: string
): string {
  const value = map[key];

  if (!value) {
    throw new Error(`Missing value for ${key}`);
  }

  return value;
}

export async function seed() {
  // insert roles
  const roles = [
    { name: 'attendee' },
    { name: 'admin' },
    { name: 'organizer' },
  ];

  await db.insert(rolesTable).values(roles).onConflictDoNothing();

  // insert permissions

  const permissions = [
    { name: 'view:users' },
    { name: 'delete:user' },
    { name: 'create:event' },
    { name: 'update:event' },
    { name: 'publish:event' },
    { name: 'cancel:event' },
    { name: 'view:bookings:all' },
  ];

  await db.insert(permissionsTable).values(permissions).onConflictDoNothing();

  const insertedRoles = await db.select().from(rolesTable);
  const insertedPermissions = await db.select().from(permissionsTable);

  const roleMap = Object.fromEntries(
    insertedRoles.map((role) => [role.name, role.id])
  );

  const permissionMap = Object.fromEntries(
    insertedPermissions.map((permission) => [permission.name, permission.id])
  );

  const organizerRoleId = getRequiredId(roleMap, 'organizer');
  const adminRoleId = getRequiredId(roleMap, 'admin');

  const rolePermissions: Array<{ roleId: string; permissionId: string }> = [
    {
      roleId: organizerRoleId,
      permissionId: getRequiredId(permissionMap, 'create:event'),
    },
    {
      roleId: organizerRoleId,
      permissionId: getRequiredId(permissionMap, 'update:event'),
    },
    {
      roleId: organizerRoleId,
      permissionId: getRequiredId(permissionMap, 'publish:event'),
    },
    {
      roleId: organizerRoleId,
      permissionId: getRequiredId(permissionMap, 'cancel:event'),
    },
    {
      roleId: adminRoleId,
      permissionId: getRequiredId(permissionMap, 'view:users'),
    },
    {
      roleId: adminRoleId,
      permissionId: getRequiredId(permissionMap, 'delete:user'),
    },
    {
      roleId: adminRoleId,
      permissionId: getRequiredId(permissionMap, 'create:event'),
    },
    {
      roleId: adminRoleId,
      permissionId: getRequiredId(permissionMap, 'update:event'),
    },
    {
      roleId: adminRoleId,
      permissionId: getRequiredId(permissionMap, 'publish:event'),
    },
    {
      roleId: adminRoleId,
      permissionId: getRequiredId(permissionMap, 'cancel:event'),
    },
    {
      roleId: adminRoleId,
      permissionId: getRequiredId(permissionMap, 'view:bookings:all'),
    },
  ];

  await db
    .insert(rolePermissionsTable)
    .values(rolePermissions)
    .onConflictDoNothing();

  await db
    .update(usersTable)
    .set({ roleId: '38710070-9ab6-4d66-b9ab-699fd04c7821' })
    .where(eq(usersTable.id, '8ac62dfc-a26e-48a8-b211-15d40cfffd38'));
}

seed()
  .then(() => {
    console.log('Seeding complete');
    process.exit();
  })
  .catch((err) => {
    console.error('Seeding failed', err);
    process.exit(1);
  });
