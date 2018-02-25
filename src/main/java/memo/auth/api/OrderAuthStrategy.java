package memo.auth.api;

import memo.model.Order;
import memo.model.User;

public class OrderAuthStrategy implements AuthenticationStrategy<Order>{
    //todo
    @Override
    public boolean isAllowedToRead(User user, Order object) {
        return true;
    }

    @Override
    public boolean isAllowedToCreate(User user, Order object) {
        return true;
    }

    @Override
    public boolean isAllowedToModify(User user, Order object) {
        return true;
    }

    @Override
    public boolean isAllowedToDelete(User user, Order object) {
        return true;
    }
}
