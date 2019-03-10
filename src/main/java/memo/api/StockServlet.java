package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.StockAuthStrategy;
import memo.data.StockRepository;
import memo.model.Color;
import memo.model.ShopItem;
import memo.model.Stock;
import memo.model.WaitingListEntry;
import memo.util.model.Page;
import org.apache.logging.log4j.LogManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Path("/stock")
@Named
@RequestScoped
public class StockServlet extends AbstractApiServlet<Stock> {
    private StockRepository stockRepository;

    public StockServlet() {
        super();
    }

    @Inject
    public StockServlet(StockRepository stockRepository,
                        StockAuthStrategy authStrategy,
                        AuthenticationService authService) {
        logger = LogManager.getLogger(StockServlet.class);
        this.stockRepository = stockRepository;
        this.authenticationStrategy = authStrategy;
        this.authenticationService = authService;
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Stock object) {
        this.manyToOne(object, ShopItem.class, Stock::getItem, Stock::getId, ShopItem::getStock, shopItem -> shopItem::setStock);
        this.manyToOne(object, Color.class, Stock::getColor, Stock::getId, Color::getStock, color -> color::setStock);
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, stockRepository);
    }



    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        Stock stock = this.post(request, body, new ApiServletPostOptions<>(
                "stock", new Stock(), Stock.class, Stock::getId
        ));

        return this.respond(stock, "id", Stock::getId);
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        Stock stock = this.put(request, body, new ApiServletPutOptions<>(
                "stock", Stock.class, Stock::getId
        ));
        return this.respond(stock, "id", Stock::getId);
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(Stock.class, request);
        return Response.status(Response.Status.OK).build();
    }
}
