package memo.api;

import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.AddressAuthStrategy;
import memo.data.AddressRepository;
import memo.model.Address;
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


    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response,
                (parameterMap, _response) -> AddressRepository.getInstance().get(getParameter(parameterMap, "id")),
                "addresses"
        );
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
