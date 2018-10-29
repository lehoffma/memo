package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.DiscountService;
import memo.model.Discount;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import java.util.List;
import java.util.Map;

@Path("/discounts")
@Named
@RequestScoped
public class DiscountServlet extends AbstractApiServlet<Discount> {
    private DiscountService discountService;

    public DiscountServlet() {
    }

    @Inject
    public DiscountServlet(DiscountService discountService,
                           AuthenticationService authService) {
        super(new ConfigurableAuthStrategy<>(true));
        this.discountService = discountService;
        this.authenticationService = authService;
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Discount object) {

    }

    @GET
    public Map<String, Object> get(@QueryParam("eventId") String eventId,
                                   @QueryParam("userId") String userId,
                                   @Context HttpServletRequest req) {
        List<Discount> discounts = this.getList(req,
                () -> discountService.getUserDiscount(eventId, userId),
                null
        );
        return buildMap("discounts", discounts);
    }

}
