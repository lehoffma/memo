package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.CapacityService;
import memo.model.EventCapacity;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Path("/capacity")
@Named
@RequestScoped
public class EventCapacityServlet extends AbstractApiServlet<EventCapacity> {
    private CapacityService capacityService;

    public EventCapacityServlet() {
        super(new ConfigurableAuthStrategy<>(true));
    }

    @Inject
    public EventCapacityServlet(CapacityService capacityService) {
        super(new ConfigurableAuthStrategy<>(true));
        this.capacityService = capacityService;
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, EventCapacity object) {

    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Map<String, List<EventCapacity>> get(@QueryParam("id") Integer id, @Context HttpServletRequest request) {
        //todo
        List<EventCapacity> capacity = this.getList(request, () -> capacityService
                .get(id)
                .map(Arrays::asList)
                .orElse(new ArrayList<>()), null);

        return buildMap("capacity", capacity);
    }
}
