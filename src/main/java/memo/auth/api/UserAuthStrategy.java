package memo.auth.api;

import memo.model.Permission;
import memo.model.User;

import java.util.Arrays;
import java.util.function.Function;

public class UserAuthStrategy implements AuthenticationStrategy<User> {
    @Override
    public boolean isAllowedToRead(User user, User object) {
        //users are publicly available
        return true;
    }

    @Override
    public boolean isAllowedToCreate(User user, User object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user is in registration process
                AuthenticationConditionFactory.userIsLoggedOut(),
                //or is created by an admin/someone with the correct permissions
                AuthenticationConditionFactory.<User>userIsLoggedIn()
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.create))
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, User object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is modifying his own profile
                AuthenticationConditionFactory.userIsAuthor(Function.identity()),
                //or is allowed to modify the user because he has the correct permissions
                AuthenticationConditionFactory.userHasCorrectPermission(
                        it -> it.getPermissions().getUserManagement(), Permission.write
                )
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, User object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is deleting his own profile
                AuthenticationConditionFactory.userIsAuthor(Function.identity()),
                //or is allowed to delete the user because he has the correct permissions
                AuthenticationConditionFactory.userHasCorrectPermission(
                        it -> it.getPermissions().getUserManagement(), Permission.delete
                )
        ));
    }
}
