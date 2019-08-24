package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.EntryAuthStrategy;
import memo.data.EntryRepository;
import memo.model.*;
import memo.model.management.AccountingTimespan;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Map;

@Path("/entry")
@Named
@RequestScoped
public class EntryServlet extends AbstractApiServlet<Entry> {
    private EntryRepository entryRepository;

    final static Logger logger = LogManager.getLogger(EntryServlet.class);

    public EntryServlet() {
    }

    @Inject
    public EntryServlet(EntryRepository entryRepository,
                        EntryAuthStrategy authStrategy,
                        AuthenticationService authService) {
        super();
        this.entryRepository = entryRepository;
        this.authenticationStrategy = authStrategy;
        this.authenticationService = authService;
    }


    @GET
    @Path("/state")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getState(@Context HttpServletRequest request) {
        User requestingUser = authenticationService.parseNullableUserFromRequestHeader(request);
        boolean isAllowed = this.authenticationStrategy.isAllowedToReadState(requestingUser);

        if (!isAllowed) {
            return Response.status(Response.Status.FORBIDDEN)
                    .build();
        }

        return Response.ok(entryRepository.state()).build();
    }

    @GET
    @Path("/timespanSummary")
    @Produces({MediaType.APPLICATION_JSON})
    public Response getTimespanSummary(@Context HttpServletRequest request) {
        User requestingUser = authenticationService.parseNullableUserFromRequestHeader(request);
        boolean isAllowed = this.authenticationStrategy.isAllowedToReadState(requestingUser);

        if (!isAllowed) {
            return Response.status(Response.Status.FORBIDDEN)
                    .build();
        }

        Map<String, String[]> parameterMap = request.getParameterMap();
        AccountingTimespan timespan = AccountingTimespan.fromQueryValue(getParameter(parameterMap, "timespan"))
                .orElseThrow(() -> new WebApplicationException(Response.Status.BAD_REQUEST));
        Integer year = timespan == AccountingTimespan.MONTH
                ? Integer.valueOf(getParameter(parameterMap, "year"))
                : null;

        return Response.ok(entryRepository.getTimespanSummaries(timespan, year)).build();
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, entryRepository);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Entry object) {
        this.manyToOne(object, ShopItem.class, Entry::getItem, Entry::getId, ShopItem::getEntries, shopItem -> shopItem::setEntries);
        this.manyToOne(object, EntryCategory.class, Entry::getCategory, Entry::getId, EntryCategory::getEntry, entryCategory -> entryCategory::setEntry);
        this.oneToMany(object, Image.class, Entry::getImages, image -> image::setEntry);
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        Entry entry = this.post(request, body, new ApiServletPostOptions<>(
                "entry", new Entry(), Entry.class, Entry::getId
        ));

        return this.respond(entry, "id", Entry::getId);
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        Entry entry = this.put(request, body, new ApiServletPutOptions<>(
                "entry", Entry.class, Entry::getId
        ));

        return this.respond(entry, "id", Entry::getId);
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(Entry.class, request);
        return Response.status(Response.Status.OK).build();
    }
}
