package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.model.Entry;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;

import static memo.auth.api.AuthenticationPredicateFactory.*;

public class EntryAuthStrategy implements AuthenticationStrategy<Entry> {
    @Override
    public boolean isAllowedToRead(User user, Entry object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.read))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Entry::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<Entry> root, User user) {
        Predicate userIsLoggedIn = userIsLoggedIn(builder, user);

        Predicate userHasCorrectPermissions = userHasCorrectPermissions(builder, user, Permission.read,
                "funds");

        Predicate userFulfillsMinimumRoleOfItem = userFulfillsMinimumRoleOfItem(builder, user, root,
                entryRoot -> entryRoot.get("item"), "expectedReadRole");

        return builder.and(
                userIsLoggedIn,
                userHasCorrectPermissions,
                userFulfillsMinimumRoleOfItem
        );
    }

    @Override
    public boolean isAllowedToCreate(User user, Entry object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.create))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Entry::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, Entry object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.write))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Entry::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, Entry object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.delete))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Entry::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }
}
