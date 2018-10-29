package memo.serialization;

import memo.data.BankAccountRepository;
import memo.data.Repository;
import memo.model.BankAcc;

public class BankAccIdDeserializer extends IdDeserializer<BankAcc, BankAccountRepository> {
    public BankAccIdDeserializer() {
        super(BankAccountRepository.class, Repository::getById, BankAcc.class);
    }
}
