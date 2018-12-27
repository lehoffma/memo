package memo.auth.api.strategy;

import memo.model.ShopItem;
import memo.model.User;
import memo.model.WaitingListEntry;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;

@Named
@ApplicationScoped
public class ShopItemWaitingListAuthStrategy implements AuthenticationStrategy<WaitingListEntry> {
    @Override
    public boolean isAllowedToRead(User user, WaitingListEntry object) {
        //todo auth
        return true;
    }

    @Override
    public boolean isAllowedToCreate(User user, WaitingListEntry object) {
        return true;
    }

    @Override
    public boolean isAllowedToModify(User user, WaitingListEntry object) {
        return true;
    }

    @Override
    public boolean isAllowedToDelete(User user, WaitingListEntry object) {
        return true;
    }
}
