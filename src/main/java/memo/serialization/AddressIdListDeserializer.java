package memo.serialization;

import memo.data.AddressRepository;
import memo.data.Repository;
import memo.model.Address;

public class AddressIdListDeserializer extends IdListDeserializer<Address> {
    public AddressIdListDeserializer() {
        super(AddressRepository::getInstance, Repository::getById, Address.class);
    }
}
