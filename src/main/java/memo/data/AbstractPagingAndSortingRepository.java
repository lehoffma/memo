package memo.data;

import memo.auth.api.strategy.AuthenticationStrategy;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.model.User;
import memo.util.DatabaseManager;
import memo.util.JsonHelper;
import memo.util.model.Filter;
import memo.util.model.Page;
import memo.util.model.PageRequest;
import memo.util.model.Sort;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

public abstract class AbstractPagingAndSortingRepository<T> implements PagingAndSortingRepository<T> {

    protected Class<T> clazz;
    protected AuthenticationStrategy<T> authenticationStrategy;

    public AbstractPagingAndSortingRepository(Class<T> clazz) {
        this.clazz = clazz;
        this.authenticationStrategy = new ConfigurableAuthStrategy<>(false);
    }

    public AbstractPagingAndSortingRepository(Class<T> clazz, AuthenticationStrategy<T> authenticationStrategy) {
        this.clazz = clazz;
        this.authenticationStrategy = authenticationStrategy;
    }


    @Override
    public Page<T> get(User requestingUser, PageRequest pageRequest, Sort sort, Filter filter) {
        EntityManager em = DatabaseManager.createEntityManager();
        return Page.fromQuery(
                QueryHelper.get(em, this, clazz, requestingUser, sort, filter),
                QueryHelper.getCountQuery(em, this, clazz, requestingUser, sort, filter),
                pageRequest
        );
    }

    @Override
    public Page<T> get(User requestingUser, PageRequest pageRequest, Filter filter) {
        return this.get(requestingUser, pageRequest, Sort.by(), filter);
    }

    @Override
    public List<T> get(User requestingUser, Sort sort, Filter filter) {
        return QueryHelper.get(DatabaseManager.createEntityManager(), this, clazz, requestingUser, sort, filter)
                .getResultList();
    }


    public Optional<T> getById(Integer id) {
        return Optional.ofNullable(id)
                .map(_id -> DatabaseManager.getInstance().getById(clazz, _id));
    }

    @Override
    public Optional<T> getById(String id) {
        return Optional.ofNullable(id)
                .filter(JsonHelper::stringIsNotEmpty)
                .map(_id -> DatabaseManager.getInstance().getByStringId(clazz, _id));
    }

    @Override
    public AuthenticationStrategy<T> getAuthenticationStrategy() {
        return this.authenticationStrategy;
    }
}
