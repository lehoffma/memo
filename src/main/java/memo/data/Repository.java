package memo.data;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

public interface Repository<T> {
    Optional<T> getById(String id);

    List<T> get(String id);

    List<T> getIf(Map<String, Function<String, List<T>>> predicateMap, List<T> defaultValue);

    List<T> getAll();
}
