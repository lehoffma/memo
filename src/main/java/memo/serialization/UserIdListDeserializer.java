package memo.serialization;

import memo.data.Repository;
import memo.data.UserRepository;
import memo.model.User;

public class UserIdListDeserializer extends IdListDeserializer<User, UserRepository> {
    public UserIdListDeserializer() {
        super(UserRepository.class, Repository::getById, User.class);
    }
}
