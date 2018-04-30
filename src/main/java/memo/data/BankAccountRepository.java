package memo.data;

import memo.auth.api.strategy.BankAccAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.model.BankAcc;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;

public class BankAccountRepository extends AbstractPagingAndSortingRepository<BankAcc> {

    protected static BankAccountRepository instance;

    private BankAccountRepository() {
        super(BankAcc.class, new BankAccAuthStrategy());
    }

    public static BankAccountRepository getInstance() {
        if (instance == null) instance = new BankAccountRepository();
        return instance;
    }

    @Override
    public List<BankAcc> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT a FROM BankAcc a", BankAcc.class).getResultList();
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<BankAcc> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest);
    }
}
