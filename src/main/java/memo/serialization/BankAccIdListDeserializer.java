package memo.serialization;

import memo.data.BankAccountRepository;
import memo.data.Repository;
import memo.model.BankAcc;

public class BankAccIdListDeserializer extends IdListDeserializer<BankAcc, BankAccountRepository> {
    public BankAccIdListDeserializer() {
        super(BankAccountRepository.class, Repository::getById, BankAcc.class);
    }
}
