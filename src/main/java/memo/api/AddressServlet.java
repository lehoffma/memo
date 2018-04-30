package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.strategy.AddressAuthStrategy;
import memo.data.AddressRepository;
import memo.model.Address;
import memo.model.ShopItem;
import memo.model.User;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "AddressServlet", value = "/api/address")
public class AddressServlet extends AbstractApiServlet<Address> {

    public AddressServlet() {
        super(new AddressAuthStrategy());
        logger = Logger.getLogger(AddressServlet.class);
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Address object) {
        this.manyToOne(object, User.class, Address::getUser, Address::getId, User::getAddresses, user -> user::setAddresses);
        this.manyToOne(object, ShopItem.class, Address::getItem, Address::getId, ShopItem::getRoute, item -> item::setRoute);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response, AddressRepository.getInstance(), "addresses");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        ApiServletPostOptions<Address, Integer> options = new ApiServletPostOptions<Address, Integer>()
                .setObjectName("address")
                .setBaseValue(new Address())
                .setClazz(Address.class)
                .setGetSerialized(Address::getId);

        this.post(request, response, options);
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {
        ApiServletPutOptions<Address, Integer> options = new ApiServletPutOptions<Address, Integer>()
                .setObjectName("address")
                .setClazz(Address.class)
                .setGetSerialized(Address::getId);
        this.put(request, response, options);
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
        this.delete(Address.class, request, response);
    }
}
