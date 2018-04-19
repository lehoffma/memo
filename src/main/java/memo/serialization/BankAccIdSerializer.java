package memo.serialization;

import memo.model.BankAcc;

public class BankAccIdSerializer extends IdSerializer<BankAcc, Integer> {
    public BankAccIdSerializer() {
        super(BankAcc::getId, BankAcc.class);
    }
}
