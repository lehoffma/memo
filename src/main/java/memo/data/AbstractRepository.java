package memo.data;

import memo.util.ApiUtils;
import memo.util.DatabaseManager;

import java.util.*;
import java.util.function.Function;

public abstract class AbstractRepository<T> implements Repository<T> {
    protected Class<T> clazz;

    public AbstractRepository(Class<T> clazz) {
        this.clazz = clazz;
    }

    public Optional<T> getById(Integer id) {
        return Optional.ofNullable(id)
                .map(_id -> DatabaseManager.getInstance().getById(clazz, _id));
    }

    @Override
    public Optional<T> getById(String id) {
        return Optional.ofNullable(id)
                .filter(ApiUtils::stringIsNotEmpty)
                .map(_id -> DatabaseManager.getInstance().getByStringId(clazz, _id));
    }
}
