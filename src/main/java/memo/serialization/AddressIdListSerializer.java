package memo.serialization;

import memo.model.Address;

public class AddressIdListSerializer extends IdListSerializer<Address, Integer> {
    public AddressIdListSerializer() {
        super(Address::getId, Address.class);
    }
}
