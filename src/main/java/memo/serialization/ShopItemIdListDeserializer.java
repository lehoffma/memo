package memo.serialization;

import memo.data.EventRepository;
import memo.data.Repository;
import memo.model.ShopItem;

public class ShopItemIdListDeserializer extends IdListDeserializer<ShopItem> {
    public ShopItemIdListDeserializer() {
        super(EventRepository::getInstance, Repository::getById, ShopItem.class);
    }
}
