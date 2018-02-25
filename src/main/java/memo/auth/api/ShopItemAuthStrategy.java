package memo.auth.api;

import memo.model.ShopItem;
import memo.model.User;

public class ShopItemAuthStrategy implements AuthenticationStrategy<ShopItem> {
    //todo refactor
    @Override
    public boolean isAllowedToRead(User user, ShopItem object) {
        return ShopItemAuthHelper.userIsAllowedToRead(user, object);
    }

    @Override
    public boolean isAllowedToCreate(User user, ShopItem object) {
        return ShopItemAuthHelper.userIsAllowedToCreate(user, object);
    }

    @Override
    public boolean isAllowedToModify(User user, ShopItem object) {
        return ShopItemAuthHelper.userIsAllowedToModify(user, object);
    }

    @Override
    public boolean isAllowedToDelete(User user, ShopItem object) {
        return ShopItemAuthHelper.userIsAllowedToDelete(user, object);
    }
}
