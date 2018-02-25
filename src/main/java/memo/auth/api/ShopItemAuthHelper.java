package memo.auth.api;

import memo.auth.AuthenticationService;
import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.EventType;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.function.BiPredicate;
import java.util.function.Function;
import java.util.function.Supplier;

import static memo.auth.AuthenticationService.isAuthorized;

public class ShopItemAuthHelper {

    private static ClubRole getUserClubRole(User user) {
        return user == null
                //only events that everybody is allowed to see are allowed if the user isn't logged in
                ? ClubRole.None
                //check expectedReadRole values (we don't want to return events an unauthorized user shouldn't see)
                : user.getClubRole();
    }


    private static Permission getEventPermission(User user, ShopItem item) {
        return Optional.ofNullable(item)
                .map(ShopItem::getType)
                .flatMap(EventType::findByValue)
                .map(type -> {
                    switch (type) {
                        case merch:
                            return user.getPermissions().getMerch();
                        case tours:
                            return user.getPermissions().getTour();
                        case partys:
                            return user.getPermissions().getParty();
                    }
                    return Permission.none;
                })
                .orElse(Permission.none);
    }

    public static boolean userIsAuthorizedForShopItem(User user, ShopItem item,
                                                      Function<ShopItem, ClubRole> expectedRoleSupplier,
                                                      Supplier<Permission> expectedPermissionSupplier) {
        return isAuthorized(
                getUserClubRole(user),
                getEventPermission(user, item),
                expectedRoleSupplier.apply(item),
                expectedPermissionSupplier.get()
        );
    }

    public static boolean userIsAllowedToRead(User user, ShopItem item) {
        return userIsAuthorizedForShopItem(user, item, ShopItem::getExpectedReadRole, () -> Permission.read);
    }

    public static boolean userIsAllowedToCreate(User user, ShopItem item) {
        return userIsAuthorizedForShopItem(user, item, ShopItem::getExpectedWriteRole, () -> Permission.create);
    }

    public static boolean userIsAllowedToModify(User user, ShopItem item) {
        return userIsAuthorizedForShopItem(user, item, ShopItem::getExpectedWriteRole, () -> Permission.write);
    }

    public static boolean userIsAllowedToDelete(User user, ShopItem item) {
        return userIsAuthorizedForShopItem(user, item, ShopItem::getExpectedWriteRole, () -> Permission.delete);
    }

}
