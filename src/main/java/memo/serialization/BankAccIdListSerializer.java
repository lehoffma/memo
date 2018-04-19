package memo.serialization;

import memo.model.BankAcc;

public class BankAccIdListSerializer extends IdListSerializer<BankAcc, Integer> {
    public BankAccIdListSerializer() {
        super(BankAcc::getId, BankAcc.class);
    }
}
