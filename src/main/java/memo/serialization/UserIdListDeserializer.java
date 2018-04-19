package memo.serialization;

import memo.data.Repository;
import memo.data.UserRepository;
import memo.model.User;

public class UserIdListDeserializer extends IdListDeserializer<User> {
    public UserIdListDeserializer(){
        super(UserRepository::getInstance, Repository::getById, User.class);
    }
}
