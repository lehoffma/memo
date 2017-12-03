package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.Color;
import memo.model.ShopItem;
import memo.model.Stock;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "StockServlet", value = "/api/stock")
public class StockServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String SeventId = request.getParameter("eventId");
        String sType = request.getParameter("type");


        List<Stock> stock = getStockFromDatabase(SeventId, sType, response);


        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(stock);

        response.getWriter().append("{ \"stock\": " + output + " }");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jStock = getJsonStock(request, response);

        //ToDo: Duplicate Events

        Stock s = createStockFromJson(jStock);

        saveStockToDatabase(s);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + s.getId() + " }");


    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jStock = getJsonStock(request, response);

        Integer jId = jStock.get("id").getAsInt();

        Stock s = DatabaseManager.createEntityManager().find(Stock.class, jId);

        if (s == null) {
            response.getWriter().append("Not found");
            response.setStatus(404);
            return;
        }

        s = updateStockFromJson(jStock, s);
        s.setId(jStock.get("id").getAsInt());


        updateStockAtDatabase(s);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + s.getId() + " }");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String Sid = request.getParameter("id");
        Integer id = Integer.parseInt(Sid);
        Stock s = DatabaseManager.createEntityManager().find(Stock.class, id);


        if (s == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeStockFromDatabase(s);


    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private List<Stock> getStockFromDatabase(String SeventId, String sType, HttpServletResponse response) throws IOException {

        if (isStringNotEmpty(SeventId)) {
            return getStockByEventId(SeventId, response);
        }

        if (isStringNotEmpty(sType)) {
            Integer type = EventServlet.getType(sType);
            return getStockByEventType(type);
        }
        return getStock();

    }

    private List<Stock> getStock() {
        return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Stock s ", Stock.class)
                .getResultList();
    }

    private List<Stock> getStockByEventType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Stock s " +
                " WHERE s.event.type = :typ", Stock.class)
                .setParameter("typ", type)
                .getResultList();
    }

    private List<Stock> getStockByEventId(String SeventId, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(SeventId);
            //ToDo: gibt null aus wenn id nicht vergeben (ich bin für optionals)
            return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Stock s " +
                    " WHERE s.event.id = :id", Stock.class)
                    .setParameter("id", id)
                    .getResultList();
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private void saveStockToDatabase(Stock s) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.persist(s.getColor());
        em.persist(s);

        em.getTransaction().commit();
    }

    private JsonObject getJsonStock(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("stock");
    }

    private Stock createStockFromJson(JsonObject jStock) {
        return updateStockFromJson(jStock, new Stock());
    }

    private Stock updateStockFromJson(JsonObject jStock, Stock s) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();

        s = gson.fromJson(jStock, Stock.class);
        JsonObject jColor = jStock.get("color").getAsJsonObject();
        Color color = gson.fromJson(jColor, Color.class);
        s.setColor(color);

        JsonObject jsonEvent = jStock.getAsJsonObject("event");
        if(jsonEvent != null){
            Integer eventId = jsonEvent.get("id").getAsInt();
            ShopItem e = DatabaseManager.createEntityManager().find(ShopItem.class, eventId);
            s.setShopItem(e);
        }
        else{
            //todo error handling
//            throw new NoSuchFieldException();
        }

        return s;
    }

    private void updateStockAtDatabase(Stock s) {
        EntityManager em = DatabaseManager.createEntityManager();


        em.getTransaction().begin();
        em.merge(s.getColor());
        em.merge(s);
        em.getTransaction().commit();
    }

    private void removeStockFromDatabase(Stock s) {

        DatabaseManager.createEntityManager().getTransaction().begin();
        s = DatabaseManager.createEntityManager().merge(s);
        DatabaseManager.createEntityManager().remove(s);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }


}
