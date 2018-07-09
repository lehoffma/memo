package memo.auth.api;

import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.model.EventType;

import java.util.Optional;

public class ShopItemAuthHelper {
    public static Permission getEventPermission(User user, ShopItem item) {
        return Optional.ofNullable(item)
                .map(ShopItem::getType)
                .flatMap(EventType::findByValue)
                .map(type -> {
                    switch (type) {
                        case merch:
                            return user.getPermissions().getMerch();
                        case tours:
                            return user.getPermissions().getTour();
                        case partys:
                            return user.getPermissions().getParty();
                    }
                    return Permission.none;
                })
                .orElse(Permission.none);
    }

}
