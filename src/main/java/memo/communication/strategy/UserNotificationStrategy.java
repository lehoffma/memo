package memo.communication.strategy;

import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.model.User;

public class UserNotificationStrategy extends BaseNotificationStrategy<User>{

    private void sendRegistrationMail(User createdUser){
        if (createdUser != null) {
            CommunicationManager.getInstance().send(createdUser, null, MessageType.REGISTRATION);
        }
    }

    @Override
    public void post(User item) {
        this.async(() -> this.sendRegistrationMail(item));
    }
}
