package memo.data;

import memo.model.User;
import memo.util.model.Filter;
import memo.util.model.Page;
import memo.util.model.PageRequest;

public interface PagingRepository<T> extends Repository<T> {
    default Page<T> get(User requestingUser, PageRequest pageRequest) {
        return this.get(requestingUser, pageRequest, Filter.by());
    }

    Page<T> get(User requestingUser, PageRequest pageRequest, Filter filter);
}
