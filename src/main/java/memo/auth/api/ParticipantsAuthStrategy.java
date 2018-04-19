package memo.auth.api;

import memo.model.ClubRole;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;

import java.util.Arrays;

public class ParticipantsAuthStrategy implements AuthenticationStrategy<OrderedItem> {
    @Override
    public boolean isAllowedToRead(User user, OrderedItem object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user is either logged in and allowed to see the shopItem
                //or the item's expected read role is "Gast", i.e. everyone is allowed to see it
                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(OrderedItem::getItem, ShopItem::getExpectedReadRole)
        ));
    }

    @Override
    public boolean isAllowedToCreate(User user, OrderedItem object) {
        //dummy since the servlet only implements GET anyway
        return true;
    }

    @Override
    public boolean isAllowedToModify(User user, OrderedItem object) {
        //dummy since the servlet only implements GET anyway
        return true;
    }

    @Override
    public boolean isAllowedToDelete(User user, OrderedItem object) {
        return userIsAuthorized(user, object, Arrays.asList(
                AuthenticationConditionFactory.userFulfillsMinimumRole(() -> ClubRole.Admin)
        ));
    }
}
