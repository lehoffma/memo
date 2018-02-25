package memo.auth.api;

import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;

import java.util.List;
import java.util.function.BiPredicate;
import java.util.function.Function;

public class AuthenticationConditionFactory {

    public static <T> BiPredicate<User, T> userFulfillsMinimumRole(
            Function<T, ShopItem> getShopItem,
            Function<ShopItem, ClubRole> expectedRoleSupplier
    ) {
        return (user, item) -> {
            ShopItem shopItem = getShopItem.apply(item);
            if (shopItem != null) {
                ClubRole expectedRole = expectedRoleSupplier.apply(shopItem);
                if (user != null) {
                    //user either created the shopItem or is allowed to see/modify it
                    return user.getClubRole().ordinal() >= expectedRole.ordinal();
                }
                //if the user is logged out, he can only see this item if the expectedRole is None
                return expectedRole == ClubRole.None;
            }
            return false;
        };
    }

    public static <T> BiPredicate<User, T> userIsAuthor(Function<T, List<User>> getAuthors) {
        return (loggedInUser, object) -> {
            List<User> authors = getAuthors.apply(object);
            if (loggedInUser != null) {
                return authors.stream().anyMatch(author -> loggedInUser.getId().equals(author.getId()));
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
