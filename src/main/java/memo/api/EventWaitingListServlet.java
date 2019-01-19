package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ModifyPrecondition;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.AuthenticationStrategy;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.auth.api.strategy.ShopItemAuthStrategy;
import memo.auth.api.strategy.ShopItemWaitingListAuthStrategy;
import memo.communication.strategy.BaseNotificationStrategy;
import memo.communication.strategy.NotificationStrategy;
import memo.data.EventRepository;
import memo.model.ShopItem;
import memo.model.WaitingListEntry;
import memo.util.DatabaseManager;
import memo.util.model.Page;
import memo.util.model.PageRequest;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

@Path("/event/waiting-list")
@Named
@RequestScoped
public class EventWaitingListServlet extends AbstractApiServlet<ShopItem> {

    private EventRepository eventRepository;
    private NotificationStrategy<WaitingListEntry> waitingListEntryNotificationStrategy;
    private AuthenticationStrategy<WaitingListEntry> waitingListEntryAuthenticationStrategy;

    public EventWaitingListServlet() {
        super(new ConfigurableAuthStrategy<>(true));
    }

    @Inject
    public EventWaitingListServlet(EventRepository eventRepository,
                                   ShopItemWaitingListAuthStrategy shopItemWaitingListAuthStrategy,
                                   ShopItemAuthStrategy shopItemAuthStrategy,
                                   AuthenticationService authenticationService) {
        super();
        this.waitingListEntryNotificationStrategy = new BaseNotificationStrategy<>();
        this.waitingListEntryAuthenticationStrategy = shopItemWaitingListAuthStrategy;
        this.eventRepository = eventRepository;
        this.authenticationService = authenticationService;
        this.authenticationStrategy = shopItemAuthStrategy;
    }

    protected List<ModifyPrecondition<WaitingListEntry>> preconditions(WaitingListEntry item) {
        return Arrays.asList(
//                new ModifyPrecondition<>(
//                        listEntry -> listEntry.getAmount() > item.getShopItem().getPaymentLimit(),
//                        "Amount has to be below max allowed amount.",
//                        Response.Status.BAD_REQUEST
//                )
        );
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, ShopItem object) {

    }


    protected void updateDependencies(JsonNode jsonNode, WaitingListEntry object) {
        this.manyToOne(object, ShopItem.class, WaitingListEntry::getShopItem, WaitingListEntry::getId, ShopItem::getWaitingList, shopItem -> shopItem::setWaitingList);

    }

    protected void updateDependencies(JsonNode jsonNode, WaitingListEntry object, WaitingListEntry previous) {
        updateDependencies(jsonNode, object);
    }


    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Page<WaitingListEntry> get(@QueryParam("eventId") String eventId, @QueryParam("id") String id, @Context HttpServletRequest request) {
        if (eventId != null) {
            List<WaitingListEntry> waitingList = DatabaseManager.createEntityManager()
                    .createQuery("SELECT w FROM WaitingListEntry w WHERE w.shopItem.id = :id", WaitingListEntry.class)
                    .setParameter("id", Integer.valueOf(eventId))
                    .getResultList();

            return new Page<>(waitingList, new PageRequest(), waitingList.size());
        }
        if (id != null) {
            WaitingListEntry entry = DatabaseManager.createEntityManager()
                    .createQuery("SELECT w FROM WaitingListEntry w WHERE w.id = :id", WaitingListEntry.class)
                    .setParameter("id", Integer.valueOf(id))
                    .getSingleResult();

            return new Page<>(Collections.singletonList(entry), new PageRequest(), 1);
        }

        throw new NotFoundException();
    }


    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        WaitingListEntry createdReservation = post(
                request, body, "waiting-list", new WaitingListEntry(), WaitingListEntry.class,
                Function.identity(), this::preconditions, waitingListEntryAuthenticationStrategy::isAllowedToCreate,
                this::updateDependencies,
                this.waitingListEntryNotificationStrategy
        );

        return this.respond(createdReservation, "id", WaitingListEntry::getId);
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        WaitingListEntry updateReservation = put(
                request, body, "waiting-list", "id", WaitingListEntry.class, Function.identity(),
                this::preconditions, waitingListEntryAuthenticationStrategy::isAllowedToModify, Function.identity(),
                this::updateDependencies, this.waitingListEntryNotificationStrategy
        );

        return this.respond(updateReservation, "id", WaitingListEntry::getId);
    }


    @DELETE
    public Response delete(@Context HttpServletRequest request, String body) {
        WaitingListEntry deletedItem = this.delete(request, WaitingListEntry.class, req -> {
            String id = request.getParameter("id");
            return DatabaseManager.getInstance().getById(WaitingListEntry.class, Integer.valueOf(id));
        }, waitingListEntryNotificationStrategy, waitingListEntryAuthenticationStrategy);

        return Response.ok().build();
    }
}
