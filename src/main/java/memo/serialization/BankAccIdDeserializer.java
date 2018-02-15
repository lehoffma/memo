package memo.serialization;

import memo.data.BankAccountRepository;
import memo.data.Repository;
import memo.model.BankAcc;

public class BankAccIdDeserializer extends IdDeserializer<BankAcc> {
    public BankAccIdDeserializer() {
        super(BankAccountRepository::getInstance, Repository::getById, BankAcc.class);
    }
}
