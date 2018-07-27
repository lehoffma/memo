package memo.serialization;

import memo.model.ShopItem;

public class ShopItemIdListSerializer extends IdListSerializer<ShopItem, Integer> {
    public ShopItemIdListSerializer() {
        super(ShopItem::getId, ShopItem.class);
    }
}
