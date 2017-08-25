package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.Address;

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

    //Tested


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String Sid = request.getParameter("id");

        List<Address> addresses = getAddressesFromDatabase(Sid, response);

        if (addresses.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("not found");
            return;
        }

        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(addresses);
        response.getWriter().append("{ \"addresses\": " + output + " }");

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jAddress = getJsonAddress(request, response);


        //ToDo: find Duplicates

        Address a = createAddressFromJson(jAddress);
        saveAddressToDatabase(a);

        response.setStatus(201);
        response.getWriter().append("{\"id\": " + a.getId() + "}");

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jAddress = getJsonAddress(request, response);


        if (!jAddress.getAsJsonObject().has("id")) {
            response.setStatus(400);
            response.getWriter().append("invalid data");
            return;
        }

        Address a = getAddressByID(jAddress.get("id").getAsString(), response);


        if (a == null) {
            response.setStatus(404);
            response.getWriter().append("not found");
            return;
        }


        a = updateAddressFromJson(jAddress, a);
        a.setId(jAddress.get("id").getAsInt());

        updateAddressAtDatabase(a);

        response.setStatus(201);
        response.getWriter().append("{\"id\": " + a.getId() + "}");

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String Sid = request.getParameter("id");

        Address a = getAddressByID(Sid, response);

        if (a == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeAddressFromDatabase(a);

    }


    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private List<Address> getAddressesFromDatabase(String Sid, HttpServletResponse response) throws IOException {

        // if ID is submitted
        if (isStringNotEmpty(Sid)) {
            Address a = getAddressByID(Sid, response);
            if (a != null) {
                List<Address> addresses = new ArrayList<>();
                addresses.add(a);
                return addresses;
            }
        }

        return getAddresses();

    }

    private Address getAddressByID(String Sid, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(Sid);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().find(Address.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private List<Address> getAddresses() {
        return DatabaseManager.createEntityManager().createQuery("SELECT a FROM Address a", Address.class).getResultList();
    }

    private JsonObject getJsonAddress(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("address");
    }

    private Address createAddressFromJson(JsonObject jAddress) {

        return updateAddressFromJson(jAddress, new Address());
    }

    private Address updateAddressFromJson(JsonObject jAddress, Address a) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        a = gson.fromJson(jAddress, Address.class);

        return a;
    }

    private void saveAddressToDatabase(Address newAddress) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.persist(newAddress);
        em.getTransaction().commit();
    }

    private void updateAddressAtDatabase(Address newAddress) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.merge(newAddress);
        em.getTransaction().commit();
    }

    private void removeAddressFromDatabase(Address u) {

        DatabaseManager.createEntityManager().getTransaction().begin();
        u = DatabaseManager.createEntityManager().merge(u);
        DatabaseManager.createEntityManager().remove(u);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }
}
