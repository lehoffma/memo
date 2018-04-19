package memo.serialization;

import memo.model.User;

public class UserIdListSerializer extends IdListSerializer<User, Integer> {
    public UserIdListSerializer() {
        super(User::getId, User.class);
    }
}
