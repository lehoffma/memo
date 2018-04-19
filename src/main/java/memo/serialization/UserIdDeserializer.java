package memo.serialization;

import memo.data.Repository;
import memo.data.UserRepository;
import memo.model.User;

public class UserIdDeserializer extends IdDeserializer<User> {
    public UserIdDeserializer() {
        super(UserRepository::getInstance, Repository::getById, User.class);
    }
}
