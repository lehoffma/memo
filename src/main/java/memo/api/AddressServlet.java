package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.api.strategy.AddressAuthStrategy;
import memo.data.AddressRepository;
import memo.model.Address;
import memo.model.ShopItem;
import memo.model.User;
import org.apache.logging.log4j.LogManager;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;

@WebServlet(name = "AddressServlet", value = "/api/address")
public class AddressServlet extends AbstractApiServlet<Address> {

    public AddressServlet() {
        super(new AddressAuthStrategy());
        logger = LogManager.getLogger(AddressServlet.class);
    }

    private List<ModifyPrecondition<Address>> getConditions(HttpServletResponse response) {
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
                        response,
                        HttpServletResponse.SC_BAD_REQUEST
                )
        );
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, Address object) {
        this.manyToOne(object, User.class, Address::getUser, Address::getId, User::getAddresses, user -> user::setAddresses);
        this.manyToOne(object, ShopItem.class, Address::getItem, Address::getId, ShopItem::getRoute, item -> item::setRoute);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response, AddressRepository.getInstance());
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        ApiServletPostOptions<Address, Integer> options = new ApiServletPostOptions<Address, Integer>()
                .setObjectName("address")
                .setBaseValue(new Address())
                .setClazz(Address.class)
                .setPreconditions(this.getConditions(response))
                .setGetSerialized(Address::getId);

        this.post(request, response, options);
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {
        ApiServletPutOptions<Address, Integer> options = new ApiServletPutOptions<Address, Integer>()
                .setObjectName("address")
                .setClazz(Address.class)
                .setPreconditions(this.getConditions(response))
                .setGetSerialized(Address::getId);
        this.put(request, response, options);
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
        this.delete(Address.class, request, response);
    }
}
