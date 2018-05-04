package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.auth.api.AuthenticationPredicateFactory;
import memo.data.util.PredicateFactory;
import memo.model.*;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.function.BiPredicate;

public class OrderAuthStrategy implements AuthenticationStrategy<Order> {
    @Override
    public boolean isAllowedToRead(User user, Order object) {
        return userIsAuthorized(user, object, Arrays.asList(
                AuthenticationConditionFactory.<Order>userIsLoggedIn()
                        .and(AuthenticationConditionFactory.userIsAuthor(Order::getUser)),

                AuthenticationConditionFactory.userFulfillsMinimumRole(() -> ClubRole.Vorstand)
        ));
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<Order> root, User user) {
        Predicate userIsAuthor = AuthenticationPredicateFactory.userIsAuthor(builder, root, user,
                orderRoot -> PredicateFactory.get(orderRoot, "user"));

        Predicate fulfillsMinimumRole = AuthenticationPredicateFactory
                .userFulfillsMinimumRole(builder, user, ClubRole.Vorstand);

        return builder.or(
                userIsAuthor,
                fulfillsMinimumRole
        );
    }

    @Override
    public boolean isAllowedToCreate(User user, Order object) {
        //checks if all of the items that are part of the order are visible to the user
        BiPredicate<User, Order> userIsAllowedToReadOrderedItems = (u, item) -> item.getItems().stream()
                .map(orderedItem -> AuthenticationConditionFactory
                        .userFulfillsMinimumRoleOfItem(OrderedItem::getItem, ShopItem::getExpectedCheckInRole)
                        .test(u, orderedItem)
                )
                .reduce(Boolean::logicalAnd)
                //there are no ordered items for some reason -> user is allowed to see it
                .orElse(true);


        return userIsAuthorized(user, object, Arrays.asList(
                AuthenticationConditionFactory.<Order>userIsLoggedIn().and(userIsAllowedToReadOrderedItems))
        );
    }

    @Override
    public boolean isAllowedToModify(User user, Order object) {
        return userIsAuthorized(user, object, Arrays.asList(
                AuthenticationConditionFactory.userFulfillsMinimumRole(() -> ClubRole.Vorstand)
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, Order object) {
        return userIsAuthorized(user, object, Arrays.asList(
                AuthenticationConditionFactory.userFulfillsMinimumRole(() -> ClubRole.Admin)
        ));
    }
}
