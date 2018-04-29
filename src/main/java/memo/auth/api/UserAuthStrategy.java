package memo.auth.api;

import memo.model.Permission;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.function.Function;

public class UserAuthStrategy implements AuthenticationStrategy<User> {
    @Override
    public boolean isAllowedToRead(User user, User object) {
        //users are publicly available
        return true;
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<User> root, User user) {
        //source: https://stackoverflow.com/questions/14675229/jpa-criteria-api-how-to-express-literal-true-and-literal-false
        //this predicate will always return true, i.e. users are publicly available
        return builder.and();
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
