package memo.data;

import memo.auth.api.DatabaseAction;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.model.PermissionState;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;

public class PermissionRepository extends AbstractPagingAndSortingRepository<PermissionState> {

    private static PermissionRepository instance;

    public static PermissionRepository getInstance() {
        if (instance == null) instance = new PermissionRepository();
        return instance;
    }

    public PermissionRepository() {
        super(
                PermissionState.class,
                new ConfigurableAuthStrategy<PermissionState>(false)
                        .set(DatabaseAction.READ, (user, o) -> true)
        );
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<PermissionState> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest);
    }

    @Override
    public List<PermissionState> getAll() {
        return DatabaseManager.createEntityManager()
                .createQuery("SELECT a FROM PermissionState a", PermissionState.class)
                .getResultList();
    }
}
