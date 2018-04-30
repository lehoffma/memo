package memo.data;

import memo.auth.api.strategy.AddressAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.model.Address;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;

public class AddressRepository extends AbstractPagingAndSortingRepository<Address> {
    protected static AddressRepository instance;

    private AddressRepository() {
        super(Address.class, new AddressAuthStrategy());
    }

    public static AddressRepository getInstance() {
        if (instance == null) instance = new AddressRepository();
        return instance;
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
