package memo.auth.api;

import memo.data.util.PredicateFactory;
import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static memo.data.util.PredicateFactory.*;

public class AuthenticationPredicateFactory {

    public static Predicate isRequestingUser(CriteriaBuilder builder,
                                             User user) {
        return get(builder, User.class, "id")
                .map(userId -> builder.equal(userId, user.getId()))
                .orElse(isFalse(builder));
    }

    public static Predicate userHasCorrectPermissions(CriteriaBuilder builder, User user,
                                                      Permission permission, String... permissionKeys) {
        if (user == null) {
            return PredicateFactory.isFalse(builder);
        }

        Predicate isRequestingUser = isRequestingUser(builder, user);

        Optional<Path<Object>> optionalPermissions = get(builder, User.class, "permissions");
        return optionalPermissions
                //any of the permissions are fulfilled
                .map(userPermissions -> Arrays.stream(permissionKeys)
                        .map(key -> builder.equal(userPermissions.get(key), permission))
                        .collect(Collectors.toList()))
                .map(permissionMatchers -> combineByOr(builder, permissionMatchers))
                //has to be requesting user AND their permissions have to match
                .map(anyPermissionMatches -> builder.and(
                        isRequestingUser,
                        anyPermissionMatches
                ))
                //the property doesn't exists for some reason
                .orElse(PredicateFactory.isFalse(builder));
    }

    public static Predicate userFulfillsMinimumRole(CriteriaBuilder builder,
                                                    User user,
                                                    ClubRole clubRole) {
        if (user == null) {
            return PredicateFactory.isFalse(builder);
        }

        return condition(builder, user.getClubRole().ordinal() >= clubRole.ordinal());
    }

    public static <T> Predicate userFulfillsMinimumRoleOfItem(CriteriaBuilder builder, User user,
                                                              Root<T> root,
                                                              Function<Path<T>, Path<ShopItem>> getItem,
                                                              String minimumRoleKey) {

        Optional<Path<ClubRole>> minimumRoleOptional = get(root, getItem)
                .flatMap(item -> get(item, minimumRoleKey));

        if (!minimumRoleOptional.isPresent()) {
            return PredicateFactory.isFalse(builder);
        }

        Path<ClubRole> minimumRole = minimumRoleOptional.get();
        if (user == null) {
            return builder.lessThanOrEqualTo(minimumRole, ClubRole.Gast);
        }

        Predicate isRequestingUser = isRequestingUser(builder, user);

        return PredicateFactory.<User, ClubRole>get(builder, User.class, "clubRole")
                .map(userClubRole -> builder.greaterThanOrEqualTo(userClubRole, minimumRole))
                .map(fulfillsMinimumRole -> builder.and(
                        isRequestingUser,
                        fulfillsMinimumRole
                ))
                .orElse(PredicateFactory.isFalse(builder));
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
        return condition(builder, user != null);
    }

    public static Predicate userIsLoggedOut(CriteriaBuilder builder, User user) {
        return userIsLoggedIn(builder, user).not();
    }

    public static <T> Predicate userIsAuthor(CriteriaBuilder builder, Root<T> root, User user,
                                             Function<Path<T>, Optional<Path<Integer>>> getAuthorId) {
        if (user == null) {
            return PredicateFactory.isFalse(builder);
        }

        List<Predicate> isAuthor = PredicateFactory
                .getByIds(builder, root, getAuthorId, user.getId());
        return PredicateFactory.combineByOr(builder, isAuthor);
    }

    public static <T> Predicate userIsOneOfAuthors(CriteriaBuilder builder, Root<T> root, User user,
                                                   Function<Path<T>, Optional<Path<List<Integer>>>> getAuthorIds) {
        if (user == null) {
            return PredicateFactory.isFalse(builder);
        }

        return PredicateFactory.isMember(builder, root,
                getAuthorIds, user.getId());
    }

    /**
     * only returns true if the object hasnt been assigned a user yet (i.e. user is in registration process)
     *
     * @param builder
     * @param root
     * @param getUser
     * @param <T>
     * @return
     */
    public static <T> Predicate userIsInRegistrationProcess(CriteriaBuilder builder, Root<T> root,
                                                            Function<Root<T>, Path<User>> getUser) {
        Path<User> user = getUser.apply(root);
        return builder.isNull(user);
    }
}
