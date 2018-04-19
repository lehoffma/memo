package memo.data;

import memo.model.Address;
import memo.model.ShopItem;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public class AddressRepository extends AbstractRepository<Address> {
    protected static AddressRepository instance;

    private AddressRepository() {
        super(Address.class);
    }

    public static AddressRepository getInstance() {
        if (instance == null) instance = new AddressRepository();
        return instance;
    }

    @Override
    public List<Address> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT a FROM Address a", Address.class).getResultList();
    }
}
