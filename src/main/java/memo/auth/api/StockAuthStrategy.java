package memo.auth.api;

import memo.model.Permission;
import memo.model.Stock;
import memo.model.User;

public class StockAuthStrategy implements AuthenticationStrategy<Stock> {
    @Override
    public boolean isAllowedToRead(User user, Stock object) {
        //todo see entryAuthStrategy - same question
        return user != null && user.getPermissions().getStock().ordinal() >= Permission.read.ordinal();
    }

    @Override
    public boolean isAllowedToCreate(User user, Stock object) {
        return user != null && user.getPermissions().getStock().ordinal() >= Permission.create.ordinal();
    }

    @Override
    public boolean isAllowedToModify(User user, Stock object) {
        return user != null && user.getPermissions().getStock().ordinal() >= Permission.write.ordinal();
    }

    @Override
    public boolean isAllowedToDelete(User user, Stock object) {
        return user != null && user.getPermissions().getStock().ordinal() >= Permission.delete.ordinal();
    }
}
