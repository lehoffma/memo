package memo.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.NotificationUnsubscriptionAuthStrategy;
import memo.communication.NotificationRepository;
import memo.communication.model.BroadcasterType;
import memo.communication.model.NotificationType;
import memo.communication.model.NotificationUnsubscription;
import memo.data.UserRepository;
import memo.model.User;
import memo.util.DatabaseManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/notificationsUnsubscriptions")
@Named
@RequestScoped
public class NotificationUnsubscriptionServlet {
    private NotificationRepository notificationRepository;
    private final ObjectMapper mapper = new ObjectMapper();
    private AuthenticationService authenticationService;
    private NotificationUnsubscriptionAuthStrategy authenticationStrategy;
    private UserRepository userRepository;

    public NotificationUnsubscriptionServlet() {
    }

    @Inject
    public NotificationUnsubscriptionServlet(NotificationRepository notificationRepository,
                                             AuthenticationService authenticationService,
                                             NotificationUnsubscriptionAuthStrategy authenticationStrategy,
                                             UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.authenticationService = authenticationService;
        this.authenticationStrategy = authenticationStrategy;
        this.userRepository = userRepository;
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public List<NotificationUnsubscription> getUnsubscriptionsOfUser(
            @Context HttpServletRequest request,
            @QueryParam("userId") Integer userId
    ) {
        User requestingUser = this.authenticationService.parseNullableUserFromRequestHeader(request);

        List<NotificationUnsubscription> unsubs = this.notificationRepository.getUnsubscriptionsOfUser(userId);

        unsubs = unsubs.stream()
                .filter(unsub -> authenticationStrategy.isAllowedToRead(requestingUser, unsub))
                .collect(Collectors.toList());

        return unsubs;
    }


    private Map<NotificationType, Map<BroadcasterType, Boolean>> parseConfigFromJson(String body) throws IOException {
        TypeReference<HashMap<Integer, Map<Integer, Boolean>>> typeRef =
                new TypeReference<HashMap<Integer, Map<Integer, Boolean>>>() {
                };
        Map<Integer, Map<Integer, Boolean>> jsonMap = mapper.readValue(body, typeRef);
        return jsonMap.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> NotificationType.fromInteger(entry.getKey()).orElseThrow(() -> new WebApplicationException("NotificationType does not exist", Response.Status.BAD_REQUEST)),
                        entry -> entry.getValue().entrySet().stream()
                                .collect(Collectors.toMap(
                                        broadcastEntry -> BroadcasterType.fromInteger(broadcastEntry.getKey()).orElseThrow(() -> new WebApplicationException("BroadcasterType does not exist", Response.Status.BAD_REQUEST)),
                                        Map.Entry::getValue
                                ))
                ));
    }

    private List<NotificationUnsubscription> unsubsFromConfig(Map<NotificationType, Map<BroadcasterType, Boolean>> config,
                                                              User user) {
        return config.entrySet().stream()
                .flatMap(it -> it.getValue().entrySet().stream()
                        .filter(entry -> !entry.getValue())
                        .map(entry -> new NotificationUnsubscription()
                                .setBroadcasterType(entry.getKey())
                                .setNotificationType(it.getKey())
                                .setUser(user)
                        )
                )
                .collect(Collectors.toList());
    }

    @POST
    @Produces({MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_JSON})
    public Response updateUnsubscriptionsOfUser(@Context HttpServletRequest request, String body) throws IOException {
        //todo auth
        User requestingUser = this.authenticationService.parseNullableUserFromRequestHeader(request);

        String userId = request.getParameter("userId");
        User user = this.userRepository.getUserByID(userId);

        Map<NotificationType, Map<BroadcasterType, Boolean>> config = this.parseConfigFromJson(body);
        List<NotificationUnsubscription> unsubscriptions = this.notificationRepository.getUnsubscriptionsOfUser(Integer.valueOf(userId));
        List<NotificationUnsubscription> newUnsubscriptions = unsubsFromConfig(config, user);

        List<NotificationUnsubscription> unsubsToAdd = newUnsubscriptions.stream()
                .filter(it -> unsubscriptions.stream()
                        .noneMatch(old -> old.getBroadcasterType() == it.getBroadcasterType()
                                && old.getNotificationType() == it.getNotificationType())
                )
                .collect(Collectors.toList());

        List<NotificationUnsubscription> unsubsToRemove = unsubscriptions.stream()
                .filter(it -> newUnsubscriptions.stream()
                        .noneMatch(old -> old.getBroadcasterType() == it.getBroadcasterType()
                                && old.getNotificationType() == it.getNotificationType())
                )
                .collect(Collectors.toList());

        //auth check
        boolean isNotAllowedToDelete = unsubsToRemove.stream().anyMatch(unsub -> !authenticationStrategy.isAllowedToDelete(requestingUser, unsub));
        if (isNotAllowedToDelete) {
            throw new WebApplicationException("You are not allowed to delete this unsubscription", Response.Status.FORBIDDEN);
        }

        boolean isNotAllowedToCreate = unsubsToAdd.stream().anyMatch(unsub -> !authenticationStrategy.isAllowedToCreate(requestingUser, unsub));
        if (isNotAllowedToCreate) {
            throw new WebApplicationException("You are not allowed to create this unsubscription", Response.Status.FORBIDDEN);
        }

        DatabaseManager.getInstance().removeAll(unsubsToRemove, NotificationUnsubscription.class);
        DatabaseManager.getInstance().saveAll(unsubsToAdd, NotificationUnsubscription.class);

        return Response.status(Response.Status.ACCEPTED)
                .entity(new HashMap<>())
                .build();
    }
}
