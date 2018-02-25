package memo.auth.api;

import memo.model.Permission;
import memo.model.User;

public class UserAuthStrategy implements AuthenticationStrategy<User> {
    //todo refactor
    @Override
    public boolean isAllowedToRead(User user, User object) {
        return true;
    }

    @Override
    public boolean isAllowedToCreate(User user, User object) {
        if (user == null) {
            //new user
            return true;
        }
        return user.getPermissions().getUserManagement().ordinal() >= Permission.create.ordinal();
    }

    @Override
    public boolean isAllowedToModify(User user, User object) {
        return user.getId().equals(object.getId()) ||
                user.getPermissions().getUserManagement().ordinal() >= Permission.write.ordinal();
    }

    @Override
    public boolean isAllowedToDelete(User user, User object) {
        return user.getId().equals(object.getId()) ||
                user.getPermissions().getUserManagement().ordinal() >= Permission.delete.ordinal();
    }
}
