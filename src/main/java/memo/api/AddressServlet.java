package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.data.AddressRepository;
import memo.model.Address;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.Serializable;
import java.util.List;

@WebServlet(name = "AddressServlet", value = "/api/address")
public class AddressServlet extends HttpServlet {

    final static Logger logger = Logger.getLogger(AddressServlet.class);


    protected void doGet(HttpServletRequest request, HttpServletResponse response) {


        ApiUtils.getInstance().setContentType(request, response);
        String Sid = request.getParameter("id");

        logger.debug("Method GET called with param ID = " + Sid);

        List<Address> addresses = AddressRepository.getInstance().get(Sid);

        if (addresses.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        ApiUtils.getInstance().serializeObject(response, addresses, "addresses");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "address");
        logger.debug("Method POST called");

        Address a = ApiUtils.getInstance().updateFromJson(jObj, new Address(), Address.class);
        DatabaseManager.getInstance().save(a);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, a.getId(), "id");
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called");
        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "address");


        if (!jObj.has("id")) {
            ApiUtils.getInstance().processInvalidError(response);
            return;
        }

        Address a = DatabaseManager.getInstance().getById(Address.class, jObj.get("id").asInt());

        if (a == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }


        a = ApiUtils.getInstance().updateFromJson(jObj, a, Address.class);
        DatabaseManager.getInstance().update(a);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, a.getId(), "id");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().deleteFromDatabase(Address.class, request, response);

    }
}
