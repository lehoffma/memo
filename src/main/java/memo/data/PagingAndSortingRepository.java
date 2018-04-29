package memo.data;

import memo.auth.api.AuthenticationStrategy;
import memo.model.User;
import memo.util.model.Filter;
import memo.util.model.Page;
import memo.util.model.PageRequest;
import memo.util.model.Sort;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;

public interface PagingAndSortingRepository<T> extends SortingRepository<T>, PagingRepository<T> {
    default Page<T> get(User requestingUser, PageRequest pageRequest, Sort sort) {
        return this.get(requestingUser, pageRequest, sort, Filter.by());
    }

    List<Predicate> fromFilter(CriteriaBuilder builder,
                               Root<T> root,
                               Filter.FilterRequest filterRequest);

    Page<T> get(User requestingUser, PageRequest pageRequest, Sort sort, Filter filter);

    AuthenticationStrategy<T> getAuthenticationStrategy();
}
