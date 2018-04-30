package memo.auth.api.strategy;

import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.List;
import java.util.function.BiPredicate;

public interface AuthenticationStrategy<T> {
    default boolean userIsAuthorized(User user, T object, List<BiPredicate<User, T>> predicates) {
        return predicates.stream()
                .anyMatch(it -> it.test(user, object));
    }

    default boolean userIsAuthorized(User user, T object, BiPredicate<User, T>... predicates) {
        return userIsAuthorized(user, object, Arrays.asList(predicates));
    }

    boolean isAllowedToRead(User user, T object);

    default Predicate isAllowedToRead(CriteriaBuilder builder,
                                      Root<T> root,
                                      User user) {
        //todo remove demo
        return builder.and();
    }

    boolean isAllowedToCreate(User user, T object);

    boolean isAllowedToModify(User user, T object);

    boolean isAllowedToDelete(User user, T object);
}
