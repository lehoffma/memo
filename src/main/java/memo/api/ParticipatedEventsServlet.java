package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.api.strategy.ParticipatedEventsAuthStrategy;
import memo.model.ShopItem;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/participatedEvents")
@Named
@RequestScoped
public class ParticipatedEventsServlet extends AbstractApiServlet<ShopItem> {
    public ParticipatedEventsServlet() {
        super();
    }

    @Inject
    public ParticipatedEventsServlet(ParticipatedEventsAuthStrategy authStrategy) {
        super();
        this.authenticationStrategy = authStrategy;
    }


    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Response get() {
//        this.get(request, response,
//                (paramMap, _response) -> EventRepository.getInstance().findByParticipant(Integer.valueOf(
//                        getParameter(paramMap, "userId")
//                )),
//                "shopItems"
//        );
        return Response.ok().build();
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, ShopItem object) {

    }
}
