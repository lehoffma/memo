package memo.data;

import memo.auth.api.strategy.BankAccAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.model.BankAcc;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;

@Named
@ApplicationScoped
public class BankAccountRepository extends AbstractPagingAndSortingRepository<BankAcc> {
    private BankAccAuthStrategy bankAccAuthStrategy;

    public BankAccountRepository() {
        super(BankAcc.class);
    }

    @Inject
    public BankAccountRepository(BankAccAuthStrategy bankAccAuthStrategy) {
        super(BankAcc.class);
        this.bankAccAuthStrategy = bankAccAuthStrategy;
    }

    @PostConstruct
    public void init() {
        authenticationStrategy = bankAccAuthStrategy;
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
