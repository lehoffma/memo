package memo.auth.api;

import memo.model.Entry;
import memo.model.Permission;
import memo.model.User;

public class EntryAuthStrategy implements AuthenticationStrategy<Entry> {
    @Override
    public boolean isAllowedToRead(User user, Entry object) {
        //todo can a user read entries of shopItems he's not allowed to look at?
        return user != null && user.getPermissions().getFunds().ordinal() >= Permission.read.ordinal();
    }

    @Override
    public boolean isAllowedToCreate(User user, Entry object) {
        return user != null && user.getPermissions().getFunds().ordinal() >= Permission.create.ordinal();
    }

    @Override
    public boolean isAllowedToModify(User user, Entry object) {
        return user != null && user.getPermissions().getFunds().ordinal() >= Permission.write.ordinal();
    }

    @Override
    public boolean isAllowedToDelete(User user, Entry object) {
        return user != null && user.getPermissions().getFunds().ordinal() >= Permission.delete.ordinal();
    }
}
