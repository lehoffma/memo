
export const enum Permission{
    owner,
    write,
    read,
    none
}

export interface UserPermissions{
    readonly merch: Permission,
    readonly userManagement: Permission,
    readonly tour: Permission,
    readonly party: Permission,
    readonly funds: Permission
}

export const AdminPermissions: UserPermissions = {
    merch: Permission.write,
    userManagement: Permission.write,
    tour: Permission.write,
    party: Permission.write,
    funds: Permission.write
};

export const VisitorPermissions: UserPermissions = {
    merch: Permission.none,
    userManagement: Permission.none,
    tour: Permission.none,
    party: Permission.none,
    funds: Permission.none
}