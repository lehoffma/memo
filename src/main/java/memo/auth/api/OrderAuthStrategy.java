package memo.auth.api;

import memo.model.*;

import java.util.Arrays;
import java.util.function.BiPredicate;

public class OrderAuthStrategy implements AuthenticationStrategy<Order> {
    @Override
    public boolean isAllowedToRead(User user, Order object) {
        //todo check ordered items for shopItems the user is not allowed to see?
        return userIsAuthorized(user, object, Arrays.asList(
                AuthenticationConditionFactory.<Order>userIsLoggedIn()
                        .and(AuthenticationConditionFactory.userIsAuthor(Order::getUser)),

                AuthenticationConditionFactory.userFulfillsMinimumRole(() -> ClubRole.Vorstand)
        ));
    }

    @Override
    public boolean isAllowedToCreate(User user, Order object) {
        //checks if all of the items that are part of the order are visible to the user
        BiPredicate<User, Order> userIsAllowedToReadOrderedItems = (u, item) -> item.getItems().stream()
                .map(orderedItem -> AuthenticationConditionFactory
                        .userFulfillsMinimumRoleOfItem(OrderedItem::getItem, ShopItem::getExpectedReadRole)
                        .test(u, orderedItem)
                )
                .reduce(Boolean::logicalAnd)
                //there are no ordered items for some reason -> user is allowed to see it
                .orElse(true);


        return userIsAuthorized(user, object, Arrays.asList(
                userIsAllowedToReadOrderedItems)
        );
    }

    @Override
    public boolean isAllowedToModify(User user, Order object) {
        //todo wer darf das denn?
        return true;
    }

    @Override
    public boolean isAllowedToDelete(User user, Order object) {
        //todo wer darf das denn? nur der admin?
        return true;
    }
}
