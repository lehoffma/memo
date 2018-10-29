package memo.serialization;

import memo.data.Repository;
import memo.data.UserRepository;
import memo.model.User;

public class UserIdDeserializer extends IdDeserializer<User, UserRepository> {
    public UserIdDeserializer() {
        super(UserRepository.class, Repository::getById, User.class);
    }
}
