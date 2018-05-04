package memo.auth.api.strategy;

import memo.auth.api.DatabaseAction;
import memo.data.util.PredicateFactory;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.HashMap;
import java.util.Map;
import java.util.function.BiPredicate;

@FunctionalInterface
interface CriteriaPredicateSupplier<T> {
    Predicate get(CriteriaBuilder builder, Root<T> root, User user);
}

public class ConfigurableAuthStrategy<T> implements AuthenticationStrategy<T> {

    private Map<DatabaseAction, BiPredicate<User, T>> predicateMap;
    private CriteriaPredicateSupplier<T> isAllowedToReadPredicate;

    private boolean defaultValue = false;

    public ConfigurableAuthStrategy() {
        predicateMap = new HashMap<>();
    }

    public ConfigurableAuthStrategy(boolean defaultValue) {
        this.defaultValue = defaultValue;
        predicateMap = new HashMap<>();
    }

    private boolean getDefault(User user, T object) {
        return this.defaultValue;
    }

    public ConfigurableAuthStrategy<T> set(DatabaseAction key, BiPredicate<User, T> value) {
        this.predicateMap.put(key, value);
        return this;
    }

    public ConfigurableAuthStrategy<T> set(CriteriaPredicateSupplier<T> supplier) {
        this.isAllowedToReadPredicate = supplier;
        return this;
    }

    @Override
    public boolean isAllowedToRead(User user, T object) {
        return this.predicateMap.getOrDefault(DatabaseAction.READ, this::getDefault).test(user, object);
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<T> root, User user) {
        return this.isAllowedToReadPredicate != null
                ? this.isAllowedToReadPredicate.get(builder, root, user)
                : PredicateFactory.condition(builder, this.defaultValue);
    }

    @Override
    public boolean isAllowedToCreate(User user, T object) {
        return this.predicateMap.getOrDefault(DatabaseAction.CREATE, this::getDefault).test(user, object);
    }

    @Override
    public boolean isAllowedToModify(User user, T object) {
        return this.predicateMap.getOrDefault(DatabaseAction.MODIFY, this::getDefault).test(user, object);
    }

    @Override
    public boolean isAllowedToDelete(User user, T object) {
        return this.predicateMap.getOrDefault(DatabaseAction.DELETE, this::getDefault).test(user, object);
    }
}
