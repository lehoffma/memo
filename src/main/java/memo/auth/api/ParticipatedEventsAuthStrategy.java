package memo.auth.api;

import memo.model.ShopItem;
import memo.model.User;

public class ParticipatedEventsAuthStrategy implements AuthenticationStrategy<ShopItem> {
    //todo
    @Override
    public boolean isAllowedToRead(User user, ShopItem object) {
        return true;
    }

    @Override
    public boolean isAllowedToCreate(User user, ShopItem object) {
        return true;
    }

    @Override
    public boolean isAllowedToModify(User user, ShopItem object) {
        return true;
    }

    @Override
    public boolean isAllowedToDelete(User user, ShopItem object) {
        return true;
    }
}
