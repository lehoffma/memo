package memo.discounts.auth;

import memo.auth.api.strategy.AuthenticationStrategy;
import memo.discounts.model.DiscountEntity;
import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.util.Arrays;

import static memo.auth.api.AuthenticationConditionFactory.userFulfillsMinimumRole;
import static memo.auth.api.AuthenticationConditionFactory.userHasCorrectPermission;

@Named
@ApplicationScoped
public class DiscountAuthStrategy implements AuthenticationStrategy<DiscountEntity> {
    @Override
    public boolean isAllowedToRead(User user, DiscountEntity object) {
        return true;
    }

    @Override
    public boolean isAllowedToCreate(User user, DiscountEntity object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //  user fulfills stock permission
                userHasCorrectPermission(it -> it.getPermissions().getStock(), Permission.create),
                //  or user is at least Vorstand
                userFulfillsMinimumRole(() -> ClubRole.Vorstand)
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, DiscountEntity object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //  user fulfills stock permission
                userHasCorrectPermission(it -> it.getPermissions().getStock(), Permission.write),
                //  or user is at least Vorstand
                userFulfillsMinimumRole(() -> ClubRole.Vorstand)
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, DiscountEntity object) {
        //there is no delete method anyway (only setting to "outdated")
        return false;
    }
}
