package memo.auth.api;

import memo.model.User;

import java.util.Map;
import java.util.function.BiPredicate;


public class ConfigurableAuthStrategy<T> implements AuthenticationStrategy<T> {

    private Map<DatabaseAction, BiPredicate<User, T>> predicateMap;

    private boolean defaultValue = false;

    public ConfigurableAuthStrategy() {

    }

    public ConfigurableAuthStrategy(boolean defaultValue) {
        this.defaultValue = defaultValue;
    }

    private boolean getDefault(User user, T object) {
        return this.defaultValue;
    }

    public ConfigurableAuthStrategy set(DatabaseAction key, BiPredicate<User, T> value) {
        this.predicateMap.put(key, value);
        return this;
    }

    @Override
    public boolean isAllowedToRead(User user, T object) {
        return this.predicateMap.getOrDefault(DatabaseAction.READ, this::getDefault).test(user, object);
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
