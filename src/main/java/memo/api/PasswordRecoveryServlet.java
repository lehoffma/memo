package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.AuthenticationService;
import memo.auth.BCryptHelper;
import memo.communication.NotificationRepository;
import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.data.UserRepository;
import memo.model.User;
import memo.util.DatabaseManager;
import memo.util.JsonHelper;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Path("/resetPassword")
@Named
@RequestScoped
public class PasswordRecoveryServlet {
    private NotificationRepository notificationRepository;
    private UserRepository userRepository;
    AuthenticationService authenticationService;

    public PasswordRecoveryServlet() {
    }

    @Inject
    public PasswordRecoveryServlet(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   AuthenticationService authenticationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.authenticationService = authenticationService;
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request,
                         String body) {
        JsonNode jsonItem = JsonHelper.getJsonObject(body, "email");
        String emailToReset = jsonItem.asText();

        List<User> users = userRepository.findByEmail(emailToReset);
        if (users.isEmpty()) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
        User user = users.get(0);
        this.notificationRepository.save(
                new Notification()
                        .setUser(user)
                        .setNotificationType(NotificationType.FORGOT_PASSWORD)
        );

        return Response.ok().build();
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        JsonNode jsonItem = JsonHelper.getJsonObject(body, "password");
        String newPassword = jsonItem.asText();
        User user = authenticationService.parseNullableUserFromRequestHeader(request);

        if (user == null) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }

        String hashedPassword = BCryptHelper.hashPassword(newPassword);
        user.setPassword(hashedPassword);
        DatabaseManager.getInstance().update(user, User.class);
        return Response.ok().build();
    }

}
