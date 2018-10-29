package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.BankAccAuthStrategy;
import memo.data.BankAccountRepository;
import memo.model.BankAcc;
import memo.model.Order;
import memo.model.User;
import org.apache.logging.log4j.LogManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Path("/bankAccount")
@Named
@RequestScoped
public class BankAccountServlet extends AbstractApiServlet<BankAcc> {
    private BankAccountRepository bankAccountRepository;

    public BankAccountServlet() {
    }

    @Inject
    public BankAccountServlet(BankAccountRepository bankAccountRepository,
                              BankAccAuthStrategy authStrategy,
                              AuthenticationService authService) {
        super();
        logger = LogManager.getLogger(BankAccountServlet.class);
        this.bankAccountRepository = bankAccountRepository;
        this.authenticationStrategy = authStrategy;
        this.authenticationService = authService;
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, BankAcc object) {
        this.manyToOne(object, User.class, BankAcc::getUser, BankAcc::getId, User::getBankAccounts, user -> user::setBankAccounts);
        this.oneToMany(object, Order.class, BankAcc::getOrder, order -> order::setBankAccount);
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, bankAccountRepository);
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        ApiServletPostOptions<BankAcc, Integer> options = new ApiServletPostOptions<BankAcc, Integer>()
                .setObjectName("account")
                .setBaseValue(new BankAcc())
                .setClazz(BankAcc.class)
                .setGetSerialized(BankAcc::getId);

        BankAcc bankAcc = this.post(request, body, options);
        return this.respond(bankAcc, options.getSerializedKey(), options.getGetSerialized());
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        ApiServletPutOptions<BankAcc, Integer> options = new ApiServletPutOptions<BankAcc, Integer>()
                .setObjectName("account")
                .setClazz(BankAcc.class)
                .setGetSerialized(BankAcc::getId);

        BankAcc bankAcc = this.put(request, body, options);
        return this.respond(bankAcc, options.getSerializedKey(), options.getGetSerialized());
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(BankAcc.class, request);
        return Response.status(Response.Status.OK).build();
    }
}
