package memo.serialization;

import memo.model.ShopItem;

public class ShopItemIdSerializer extends IdSerializer<ShopItem, Integer> {
    public ShopItemIdSerializer() {
        super(ShopItem::getId, ShopItem.class);
    }
}
