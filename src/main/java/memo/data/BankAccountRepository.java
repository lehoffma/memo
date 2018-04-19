package memo.data;

import memo.model.BankAcc;
import memo.util.DatabaseManager;

import java.util.Collections;
import java.util.List;

public class BankAccountRepository extends AbstractRepository<BankAcc> {

    protected static BankAccountRepository instance;

    private BankAccountRepository() {
        super(BankAcc.class);
    }

    public static BankAccountRepository getInstance() {
        if (instance == null) instance = new BankAccountRepository();
        return instance;
    }

    @Override
    public List<BankAcc> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT a FROM BankAcc a", BankAcc.class).getResultList();
    }
}
