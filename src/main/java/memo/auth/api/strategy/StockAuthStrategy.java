package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.auth.api.AuthenticationPredicateFactory;
import memo.model.*;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;

@Named
@ApplicationScoped
public class StockAuthStrategy implements AuthenticationStrategy<Stock> {
    @Override
    public boolean isAllowedToRead(User user, Stock object) {
        return userIsAuthorized(user, object, Arrays.asList(
                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                        Stock::getItem, ShopItem::getExpectedReadRole
                )
        ));
    }

    @Override
    public boolean isAllowedToReadState(User user) {
        return userIsAuthorized(user, null, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Stock>userIsLoggedIn()
                        //..and has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getStock(), Permission.read))
        ));
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<Stock> root, User user) {
        return AuthenticationPredicateFactory.userFulfillsMinimumRoleOfItem(builder, user, root,
                "item", "expectedReadRole");
    }

    @Override
    public boolean isAllowedToCreate(User user, Stock object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Stock>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.create))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Stock::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, Stock object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Stock>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.write))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Stock::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, Stock object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Stock>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.delete))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Stock::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }
}
