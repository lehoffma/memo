package memo.serialization;

import memo.data.AddressRepository;
import memo.data.Repository;
import memo.model.Address;

public class AddressIdListDeserializer extends IdListDeserializer<Address, AddressRepository> {
    public AddressIdListDeserializer() {
        super(AddressRepository.class, Repository::getById, Address.class);
    }
}
