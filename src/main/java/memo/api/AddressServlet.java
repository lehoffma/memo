package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.CharStreams;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import memo.model.Address;
import org.apache.log4j.Logger;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet(name = "AddressServlet", value = "/api/address")
public class AddressServlet extends HttpServlet {

    final static Logger logger = Logger.getLogger(AddressServlet.class);


    protected void doGet(HttpServletRequest request, HttpServletResponse response) {


        ApiUtils.setContentType(request, response);

        String Sid = request.getParameter("id");

        logger.debug("Method GET called with param ID = " + Sid);

        List<Address> addresses = getAddressesFromDatabase(Sid, response);

        if (addresses.isEmpty()) {
            try {
                response.setStatus(404);
                logger.trace("No object found with id = " + Sid);
                response.getWriter().append("not found");
                return;

            } catch (IOException e) {
                logger.warn("IO Error", e);
            }

        }

        try {

            ObjectMapper mapper = new ObjectMapper();
            String output = mapper.writeValueAsString(addresses);
            logger.trace("Serialization of object with id =" + Sid);
            response.getWriter().append("{ \"addresses\": " + output + " }");

        } catch (Exception e) {
            logger.error("Unhandled Exception", e);
        }

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.setContentType(request, response);

        JsonNode jObj = ApiUtils.getJsonObject(request, "address");

        logger.debug("Method POST called");

        Address a = ApiUtils.updateFromJson(jObj, new Address(), Address.class);

        DatabaseManager.save(a);

        response.setStatus(201);

        try {
            response.getWriter().append("{\"id\": " + a.getId() + "}");
        } catch (IOException e) {
            logger.warn("IO Error", e);
        }

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.setContentType(request, response);

        logger.debug("Method PUT called");

        JsonNode jObj = ApiUtils.getJsonObject(request, "address");


        if (!jObj.has("id")) {
            try {
                response.setStatus(400);
                response.getWriter().append("invalid data");
                return;
            } catch (Exception e) {
                logger.warn("IO Error", e);
            }
        }

        Address a = DatabaseManager.getById(Address.class, jObj.get("id").asInt());


        if (a == null) {
            try {
                response.setStatus(404);
                response.getWriter().append("not found");
                logger.debug("Object not found");
                return;
            } catch (Exception e) {
                logger.warn("IO Error", e);
            }
        }


        a = ApiUtils.updateFromJson(jObj, a, Address.class);

        DatabaseManager.update(a);

        response.setStatus(201);
        try {
            response.getWriter().append("{\"id\": " + a.getId() + "}");
        } catch (IOException e) {
            logger.warn("IO Error", e);
        }

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.setContentType(request, response);

        String Sid = request.getParameter("id");

        Address a = DatabaseManager.getById(Address.class, Sid);

        if (a == null) {
            response.setStatus(404);
            try {
                response.getWriter().append("Not Found");
            } catch (IOException e) {
                logger.warn("IO Error",e);
            }
            return;
        }

        DatabaseManager.remove(a);

    }

    private List<Address> getAddressesFromDatabase(String Sid, HttpServletResponse response) {

        // if ID is submitted
        if (ApiUtils.isStringNotEmpty(Sid)) {
            Address a = DatabaseManager.getById(Address.class, Sid);
            if (a != null) {
                List<Address> addresses = new ArrayList<>();
                addresses.add(a);
                return addresses;
            }
        }

        return getAddresses();

    }

    private List<Address> getAddresses() {
        return DatabaseManager.createEntityManager().createQuery("SELECT a FROM Address a", Address.class).getResultList();
    }

}
