package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.auth.api.AuthenticationPredicateFactory;
import memo.model.ClubRole;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.context.RequestScoped;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;


@Named
@ApplicationScoped
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
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<OrderedItem> root, User user) {
        return AuthenticationPredicateFactory.userFulfillsMinimumRoleOfItem(builder, user, root,
                "item", "expectedReadRole");
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
