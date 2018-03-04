package memo.auth.api;

import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;

import java.util.function.BiPredicate;
import java.util.function.Function;
import java.util.function.Supplier;

public class AuthenticationConditionFactory {

    public static <T> BiPredicate<User, T> userFulfillsMinimumRole(
            Supplier<ClubRole> expectedRoleSupplier
    ) {
        return (user, item) -> user.getClubRole().ordinal() >= expectedRoleSupplier.get().ordinal();
    }

    public static <T> BiPredicate<User, T> userFulfillsMinimumRoleOfItem(
            Function<T, ShopItem> getShopItem,
            Function<ShopItem, ClubRole> expectedRoleSupplier
    ) {
        return (user, item) -> {
            ShopItem shopItem = getShopItem.apply(item);
            if (shopItem != null) {
                ClubRole expectedRole = expectedRoleSupplier.apply(shopItem);
                if (user != null) {
                    //user either created the shopItem or is allowed to see/modify it
                    return userFulfillsMinimumRole(() -> expectedRole).test(user, item);
                }
                //if the user is logged out, he can only see this item if the expectedRole is None
                return expectedRole == ClubRole.None;
            }
            return false;
        };
    }

    public static <T> BiPredicate<User, T> userIsAuthor(Function<T, User> getAuthor) {
        return (loggedInUser, object) -> {
            User authors = getAuthor.apply(object);
            if (loggedInUser != null && authors != null) {
                return loggedInUser.getId().equals(authors.getId());
            }
            return false;
        };
    }

    public static <T> BiPredicate<User, T> userHasCorrectPermission(
            Function<User, Permission> getPermission,
            Permission permission
    ) {
        return (loggedInUser, object) -> {
            if (loggedInUser != null) {
                Permission userPermission = getPermission.apply(loggedInUser);
                //logged in user is either the same as the one belonging to the address or is allowed to read it anyway
                return userPermission.ordinal() >= permission.ordinal();
            }
            return false;
        };
    }

    public static <T> BiPredicate<User, T> userIsLoggedIn() {
        return (BiPredicate<User, T>) userIsLoggedOut().negate();
    }

    public static <T> BiPredicate<User, T> userIsLoggedOut() {
        return (user, t) -> user == null;
    }

    public static <T> BiPredicate<User, T> userIsInRegistrationProcess(Function<T, User> getUser) {
        return (user, t) -> getUser.apply(t) == null;
    }
}
