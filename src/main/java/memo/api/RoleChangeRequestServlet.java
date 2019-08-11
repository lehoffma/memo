package memo.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import memo.communication.NotificationRepository;
import memo.communication.model.Notification;
import memo.communication.model.NotificationType;
import memo.data.UserRepository;
import memo.model.ClubRole;
import memo.model.User;
import memo.util.JsonHelper;
import memo.util.MapBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.annotation.PreDestroy;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Arrays;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Path("/requestRoleChange")
@Named
@RequestScoped
public class RoleChangeRequestServlet {
    private static final Logger logger = LogManager.getLogger(RoleChangeRequestServlet.class);
    private NotificationRepository notificationRepository;
    private UserRepository userRepository;
    private ExecutorService executorService = Executors.newFixedThreadPool(1);

    public RoleChangeRequestServlet() {
        executorService.shutdownNow();
    }

    @PreDestroy
    public void onDestroy() {
        this.executorService.shutdownNow();
    }

    @Inject
    public RoleChangeRequestServlet(NotificationRepository notificationRepository,
                                    UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private static Optional<ClubRole> fromClubRoleValue(String value) {
        return Arrays.stream(ClubRole.values())
                .filter(it -> it.name().equalsIgnoreCase(value))
                .findAny();
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) throws JsonProcessingException {
        Optional<JsonNode> json = JsonHelper.getJsonObject(body);
        if (json.isPresent()) {
            JsonNode jsonNode = json.get();
            String jsonRole = jsonNode.get("newRole").asText();
            Optional<ClubRole> newRole = ClubRole.fromString(jsonRole);
            int userId = jsonNode.get("userId").asInt();

            if (newRole.isPresent()) {
                ClubRole clubRole = newRole.get();
                User user = userRepository.getUserByID(userId);
                User admin = userRepository.getAdmin();
                if (user != null) {
                    ObjectMapper mapper = new ObjectMapper();
                    String data = mapper.writeValueAsString(new MapBuilder<String, Object>()
                            .buildPut("userId", user.getId())
                            .buildPut("newRole", clubRole));

                    executorService.execute(() -> {
                        this.notificationRepository.save(
                                new Notification()
                                        .setUser(admin)
                                        .setNotificationType(NotificationType.CLUBROLE_CHANGE_REQUEST)
                                        .setData(data)
                        );
                    });

                    return Response.ok().build();
                } else {
                    logger.error("The given userId " + userId + " doesn't match any user in the database.");
                }
            } else {
                logger.error("The given clubRole value '" + jsonRole + "' is not valid");
            }
        }
        logger.error("Could not notify admin about request change of user role.");
        throw new WebApplicationException(Response.Status.NOT_FOUND);
    }
}
