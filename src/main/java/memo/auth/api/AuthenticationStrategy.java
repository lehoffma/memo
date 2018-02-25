package memo.auth.api;

import memo.model.User;

import java.util.List;
import java.util.function.BiPredicate;

public interface AuthenticationStrategy<T> {
    default boolean userIsAuthorized(User user, T object, List<BiPredicate<User, T>> predicates) {
        return predicates.stream()
                .anyMatch(it -> it.test(user, object));
    }

    boolean isAllowedToRead(User user, T object);

    boolean isAllowedToCreate(User user, T object);

    boolean isAllowedToModify(User user, T object);

    boolean isAllowedToDelete(User user, T object);
}
