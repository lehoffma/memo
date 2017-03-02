export enum Permission{
    owner = 3,
    write = 2,
    read = 1,
    none = 0
}

export interface UserPermissions{
    readonly userManagement: Permission,
    readonly tour: Permission,
    readonly party: Permission,
    readonly merch: Permission,
    readonly funds: Permission,
    readonly stock: Permission,
    readonly accountManagement: Permission
}

export const adminPermissions: UserPermissions = {
    userManagement: Permission.write,
    tour: Permission.write,
    party: Permission.write,
    merch: Permission.write,
    funds: Permission.write,
    stock: Permission.write,
    accountManagement: Permission.owner
};

export const visitorPermissions: UserPermissions = {
    userManagement: Permission.none,
    tour: Permission.read,
    party: Permission.read,
    merch: Permission.read,
    funds: Permission.none,
    stock: Permission.none,
    accountManagement: Permission.none
};