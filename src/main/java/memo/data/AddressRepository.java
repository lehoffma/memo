package memo.data;

import memo.auth.api.strategy.AddressAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.model.Address;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;

@Named
@ApplicationScoped
public class AddressRepository extends AbstractPagingAndSortingRepository<Address> implements Repository<Address> {
    public AddressRepository() {
        super(Address.class);
    }

    @Inject
    public AddressRepository(AddressAuthStrategy authStrategy) {
        super(Address.class);
        authenticationStrategy = authStrategy;
    }


    @Override
    public List<Address> getAll() {
        return DatabaseManager.createEntityManager()
                .createQuery("SELECT a FROM Address a", Address.class)
                .getResultList();
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<Address> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest);
    }
}
