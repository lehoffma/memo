package memo.serialization;

import memo.data.EventRepository;
import memo.data.Repository;
import memo.model.ShopItem;

public class ShopItemIdDeserializer extends IdDeserializer<ShopItem> {
    public ShopItemIdDeserializer() {
        super(EventRepository::getInstance, Repository::getById, ShopItem.class);
    }
}
