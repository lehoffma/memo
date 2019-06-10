package memo.api;

import memo.communication.NotificationRepository;
import memo.communication.model.NotificationUnsubscription;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("/notificationsUnsubscriptions")
@Named
@RequestScoped
public class NotificationUnsubscriptionServlet {

    private NotificationRepository notificationRepository;


    public NotificationUnsubscriptionServlet() {
    }

    @Inject
    public NotificationUnsubscriptionServlet(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public List<NotificationUnsubscription> getUnsubscriptionsOfUser(
            @QueryParam("userId") Integer userId) {
        return this.notificationRepository.getUnsubscriptionsOfUser(userId);
    }


    //todo updateUnsubscriptionsOfUser(Map<NotificationType, Map<BroadcasterType, Boolean>> config) or something like that
}
