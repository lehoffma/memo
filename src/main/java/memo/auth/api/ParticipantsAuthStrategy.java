package memo.auth.api;

import memo.model.OrderedItem;
import memo.model.User;

public class ParticipantsAuthStrategy implements AuthenticationStrategy<OrderedItem> {
    //todo
    @Override
    public boolean isAllowedToRead(User user, OrderedItem object) {
        return true;
    }

    @Override
    public boolean isAllowedToCreate(User user, OrderedItem object) {
        return true;
    }

    @Override
    public boolean isAllowedToModify(User user, OrderedItem object) {
        return true;
    }

    @Override
    public boolean isAllowedToDelete(User user, OrderedItem object) {
        return true;
    }
}
