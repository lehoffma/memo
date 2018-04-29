package memo.data;

import java.util.*;
import java.util.function.Function;

public interface Repository<T> {
    Optional<T> getById(String id);

    default List<T> get(String id) {
        return this.getById(id)
                .map(Collections::singletonList)
                .orElse(new ArrayList<>());
    }

    default List<T> getIf(Map<String, Function<String, List<T>>> predicateMap, List<T> defaultValue) {
        for (Map.Entry<String, Function<String, List<T>>> entry : predicateMap.entrySet()) {
            if (entry.getKey() != null) {
                return entry.getValue().apply(entry.getKey());
            }
        }
        return defaultValue;
    }

    List<T> getAll();
}
