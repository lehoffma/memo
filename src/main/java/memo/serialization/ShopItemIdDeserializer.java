package memo.serialization;

import memo.data.EventRepository;
import memo.data.Repository;
import memo.model.ShopItem;

public class ShopItemIdDeserializer extends IdDeserializer<ShopItem, EventRepository> {
    public ShopItemIdDeserializer() {
        super(EventRepository.class, Repository::getById, ShopItem.class);
    }
}
