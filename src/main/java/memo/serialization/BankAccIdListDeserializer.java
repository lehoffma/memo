package memo.serialization;

import memo.data.BankAccountRepository;
import memo.data.Repository;
import memo.model.BankAcc;

public class BankAccIdListDeserializer extends IdListDeserializer<BankAcc> {
    public BankAccIdListDeserializer() {
        super(BankAccountRepository::getInstance, Repository::getById, BankAcc.class);
    }
}
