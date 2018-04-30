package memo.auth.api;

import memo.data.util.PredicateFactory;
import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;

import javax.persistence.criteria.*;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public class AuthenticationPredicateFactory {
    public static Predicate userHasCorrectPermissions(CriteriaBuilder builder, User user,
                                                      Permission permission, String... permissionKeys) {
        if (user == null) {
            return PredicateFactory.isFalse(builder);
        }

        CriteriaQuery<User> q = builder.createQuery(User.class);
        Root<User> userRoot = q.from(User.class);

        Path<Object> userPermissions = userRoot.get("permissions");
        Predicate isRequestingUser = builder.equal(userRoot, user.getId());

        List<Predicate> permissionMatchers = Arrays.stream(permissionKeys)
                .map(key -> builder.equal(userPermissions.get(key), permission))
                .collect(Collectors.toList());

        Predicate anyPermissionMatches = PredicateFactory.combineByOr(builder, permissionMatchers);

        return builder.and(isRequestingUser, anyPermissionMatches);
    }

    public static <T> Predicate userFulfillsMinimumRoleOfItem(CriteriaBuilder builder, User user,
                                                              Root<T> root,
                                                              Function<Root<T>, Path<ShopItem>> getItem,
                                                              String minimumRoleKey) {
        if (user == null) {
            return PredicateFactory.isFalse(builder);
        }

        CriteriaQuery<User> q = builder.createQuery(User.class);
        Root<User> userRoot = q.from(User.class);
        Predicate isRequestingUser = builder.equal(userRoot, user.getId());


        Path<ClubRole> userClubRole = userRoot.get("clubRole");

        Path<ShopItem> item = getItem.apply(root);
        Path<ClubRole> minimumRole = item.get(minimumRoleKey);

        Predicate fulfillsMinimumRole = builder.greaterThanOrEqualTo(userClubRole, minimumRole);

        return builder.and(isRequestingUser, fulfillsMinimumRole);
    }

    public static <T> Predicate valuesAreNull(CriteriaBuilder builder, Root<T> root,
                                              String... keys
    ) {
        List<Predicate> keyIsNullPredicates = Arrays.stream(keys)
                .map(root::get)
                .map(builder::isNull)
                .collect(Collectors.toList());

        return keyIsNullPredicates.stream()
                .reduce(PredicateFactory.isTrue(builder), builder::and);
    }

    public static Predicate userIsLoggedIn(CriteriaBuilder builder, User user) {
        return user == null
                ? PredicateFactory.isFalse(builder)
                : PredicateFactory.isTrue(builder);
    }

    public static Predicate userIsLoggedOut(CriteriaBuilder builder, User user) {
        return userIsLoggedIn(builder, user).not();
    }
}
