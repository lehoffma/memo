package memo.data;

import memo.auth.api.AddressAuthStrategy;
import memo.model.Address;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
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
        switch (filterRequest.getKey()) {
            case "id":
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), Integer.valueOf(filterRequest.getValue()))
                );
            default:
                return Arrays.asList(
                        builder.equal(root.get(filterRequest.getKey()), filterRequest.getValue())
                );
        }
    }
}
