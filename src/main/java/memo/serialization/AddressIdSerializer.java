package memo.serialization;

import memo.model.Address;

public class AddressIdSerializer extends IdSerializer<Address, Integer> {
    public AddressIdSerializer() {
        super(Address::getId, Address.class);
    }
}
