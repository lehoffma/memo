package memo.serialization;

import memo.data.EventRepository;
import memo.data.Repository;
import memo.model.ShopItem;

public class ShopItemIdListDeserializer extends IdListDeserializer<ShopItem, EventRepository> {
    public ShopItemIdListDeserializer() {
        super(EventRepository.class, Repository::getById, ShopItem.class);
    }
}
