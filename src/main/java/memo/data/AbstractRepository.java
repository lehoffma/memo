package memo.data;

import memo.util.ApiUtils;
import memo.util.DatabaseManager;

import java.awt.image.DataBuffer;
import java.util.*;
import java.util.function.Function;

public abstract class AbstractRepository<T> implements Repository<T> {
    protected Class<T> clazz;

    public AbstractRepository(Class<T> clazz) {
        this.clazz = clazz;
    }

    @Override
    public List<T> getIf(Map<String, Function<String, List<T>>> predicateMap, List<T> defaultValue) {
        for (Map.Entry<String, Function<String, List<T>>> entry : predicateMap.entrySet()) {
            if (entry.getKey() != null) {
                return entry.getValue().apply(entry.getKey());
            }
        }
        return defaultValue;
    }

    @Override
    public List<T> getIfAllMatch(Map<List<String>, Function<List<String>, List<T>>> predicateMap, List<T> defaultValue) {
        return predicateMap.entrySet().stream()
                .filter(entry -> entry.getKey().stream().allMatch(ApiUtils::stringIsNotEmpty))
                .map(entry -> entry.getValue().apply(entry.getKey()))
                .findFirst()
                .orElse(defaultValue);
    }

    @Override
    public List<T> get(String id) {
        return this.getById(id)
                .map(Collections::singletonList)
                .orElse(new ArrayList<>());
    }

    public Optional<T> getById(Integer id){
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
