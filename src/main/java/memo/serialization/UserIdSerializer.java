package memo.serialization;

import memo.model.User;

public class UserIdSerializer extends IdSerializer<User, Integer> {
    public UserIdSerializer() {
        super(User::getId, User.class);
    }
}
