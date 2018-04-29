package memo.data;

import memo.model.User;
import memo.util.model.Filter;
import memo.util.model.Sort;

import java.util.List;

public interface SortingRepository<T> extends Repository<T> {
    default List<T> get(User requestingUser, Sort sort) {
        return this.get(requestingUser, sort, Filter.by());
    }

    List<T> get(User requestingUser, Sort sort, Filter filter);
}
