package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.StockAuthStrategy;
import memo.data.StockStateRepository;
import memo.model.Stock;
import memo.model.User;
import memo.model.management.StockState;
import org.apache.logging.log4j.LogManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

@Path("/stock")
@Named
@RequestScoped
public class StockStateServlet extends AbstractApiServlet<Stock> {

    private StockStateRepository stockStateRepository;

    public StockStateServlet() {
        super();
        logger = LogManager.getLogger(StockStateServlet.class);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Stock object) {

    }

    @Inject
    public StockStateServlet(
            StockStateRepository stockStateRepository,
            StockAuthStrategy stockAuthStrategy,
            AuthenticationService authenticationService
    ) {
        this.stockStateRepository = stockStateRepository;
        this.authenticationStrategy = stockAuthStrategy;
        this.authenticationService = authenticationService;
    }


    @GET
    @Path("/state")
    @Produces({MediaType.APPLICATION_JSON})
    public Response readState(@Context HttpServletRequest request) {
        User requestingUser = authenticationService.parseNullableUserFromRequestHeader(request);
        boolean isAllowed = this.authenticationStrategy.isAllowedToReadState(requestingUser);

        if (!isAllowed) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        StockState state = this.stockStateRepository.getState();

        Map<String, StockState> response = new HashMap<>();
        response.put("state", state);

        return Response.ok(response).build();
    }
}
