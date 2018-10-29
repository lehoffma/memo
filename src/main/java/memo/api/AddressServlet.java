package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.AddressAuthStrategy;
import memo.data.AddressRepository;
import memo.model.Address;
import memo.model.ShopItem;
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
import java.util.Arrays;
import java.util.List;

@Path("/address")
@Named
@RequestScoped
public class AddressServlet extends AbstractApiServlet<Address> {
    private AddressRepository addressRepository;

    public AddressServlet() {
    }

    @Inject
    public AddressServlet(AddressRepository addressRepository,
                          AddressAuthStrategy authStrategy,
                          AuthenticationService authService) {
        super();
        logger = LogManager.getLogger(AddressServlet.class);
        this.addressRepository = addressRepository;
        this.authenticationStrategy = authStrategy;
        this.authenticationService = authService;
    }

    private List<ModifyPrecondition<Address>> getConditions() {
        return Arrays.asList(
                new ModifyPrecondition<>(
                        address -> {
                            boolean hasLatLong = address.getLatitude() != null && address.getLongitude() != null;

                            if (hasLatLong) {
                                return false;
                            }

                            return address.getStreet() == null && address.getStreetNr() == null;
                        },
                        "This address is not valid: Street and Street Nr are missing (would be ok if lat/long was set)",
                        Response.Status.BAD_REQUEST
                )
        );
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, Address object) {
        this.manyToOne(object, User.class, Address::getUser, Address::getId, User::getAddresses, user -> user::setAddresses);
        this.manyToOne(object, ShopItem.class, Address::getItem, Address::getId, ShopItem::getRoute, item -> item::setRoute);
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, this.addressRepository);
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        ApiServletPostOptions<Address, Integer> options = new ApiServletPostOptions<Address, Integer>()
                .setObjectName("address")
                .setBaseValue(new Address())
                .setClazz(Address.class)
                .setPreconditions(this.getConditions())
                .setGetSerialized(Address::getId);

        Address address = this.post(request, body, options);
        return this.respond(address, options.getSerializedKey(), options.getGetSerialized());
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {
        ApiServletPutOptions<Address, Integer> options = new ApiServletPutOptions<Address, Integer>()
                .setObjectName("address")
                .setClazz(Address.class)
                .setPreconditions(this.getConditions())
                .setGetSerialized(Address::getId);

        Address address = this.put(request, body, options);
        return this.respond(address, options.getSerializedKey(), options.getGetSerialized());
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(Address.class, request);
        return Response.status(Response.Status.OK).build();
    }
}
