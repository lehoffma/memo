package memo.auth.api;

import memo.data.util.PredicateFactory;
import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.PermissionState;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.function.Function;

import static memo.data.util.PredicateFactory.condition;

public class AuthenticationPredicateFactory {

    public static Predicate userHasPermissions(CriteriaBuilder builder, User user, Permission permission,
                                               Function<PermissionState, Permission> getPermission
    ) {
        return builder.isTrue(
                builder.literal(getPermission.apply(user.getPermissions()).toValue() >= permission.toValue())
        );
    }

    public static <T> Predicate userIsAuthor(CriteriaBuilder builder, Root<T> root, User user,
                                             String... pathToAuthor) {
        return PredicateFactory.get(root, pathToAuthor)
                .map(it -> builder.and(
                        builder.isNotNull(it),
                        PredicateFactory.get(it, "id")
                                .map(id -> builder.equal(id, user.getId()))
                                .orElse(PredicateFactory.isFalse(builder))
                ))
                .orElse(PredicateFactory.isFalse(builder));
    }


    public static <T> Predicate userFulfillsMinimumRoleOfItem(CriteriaBuilder builder, User user,
                                                              Root<T> root,
                                                              String... pathToRole) {
        if (user == null) {
            return PredicateFactory.<T, ClubRole>get(root, pathToRole)
                    .map(role -> builder.equal(role, ClubRole.Gast))
                    .orElse(PredicateFactory.isFalse(builder));
        }

        return PredicateFactory.<T, ClubRole>get(root, pathToRole)
                .map(role -> builder.lessThanOrEqualTo(role, user.getClubRole()))
                .orElse(PredicateFactory.isFalse(builder));
    }


    public static Predicate userIsLoggedIn(CriteriaBuilder builder, User user) {
        return condition(builder, user != null);
    }

    public static Predicate userIsLoggedOut(CriteriaBuilder builder, User user) {
        return userIsLoggedIn(builder, user).not();
    }


    public static Predicate userFulfillsMinimumRole(CriteriaBuilder builder,
                                                    User user,
                                                    ClubRole clubRole) {
        if (user == null) {
            return PredicateFactory.isFalse(builder);
        }

        return condition(builder, user.getClubRole().ordinal() >= clubRole.ordinal());
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
