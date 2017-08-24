package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.*;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@WebServlet(name = "OrderServlet",value = "/api/order")
public class OrderServlet extends HttpServlet {

    List<Size> updatedSizes;


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        String Sid = request.getParameter("id");
        String SuserId = request.getParameter("userId");

        List<Order> orders = getOrdersFromDatabase(Sid,SuserId,response);

        if (orders.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }

        //ToDo: OrderedItems
        Gson gson = new GsonBuilder().serializeNulls().create();
        response.getWriter().append("{ \"orders\": [");

        for (int i=0;i<orders.size();++i) {
            if (i!=0) response.getWriter().append(",");

            Order o = orders.get(i);

            List<OrderedItem> itemList = getOrderedItemsByOrderId(o.getId());

        String output = gson.toJson(o);
        String items = gson.toJson(itemList);

        response.getWriter().append(output + ", \"orderedItems\""+ items );

        }
        response.getWriter().append("]}");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        JsonObject jOrder = getJsonOrder(request,response);

        System.out.println(jOrder);
        // ToDo: find multiple

        Order newOrder = createOrderFromJson(jOrder);

        System.out.println(newOrder);

        // update Dependencies

        updatedSizes = new ArrayList<>();

        JsonArray jOrderItems = jOrder.get("orderedItems").getAsJsonArray();

        List<OrderedItem> items = updateOrderedItemsFromJson(jOrderItems,newOrder);


        saveOrderToDatabase(newOrder, items);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + newOrder.getId() + " }");

        System.out.println(newOrder.toString());

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        JsonObject jOrder = getJsonOrder(request,response);

        Integer id = jOrder.get("id").getAsInt();

        Order o = getOrderByID(id.toString(),response);

        if (o == null)
        {
            response.getWriter().append("Not found");
            response.setStatus(404);
            return;
        }



        o = updateOrderFromJson(jOrder,o);
        o.setId(jOrder.get("id").getAsInt());

        updatedSizes = new ArrayList<>();

        List<OrderedItem> items = new ArrayList<>();
        if (jOrder.has("orderdItems")){
        JsonArray jOrderItems = jOrder.get("orderedItems").getAsJsonArray();
        items = updateOrderedItemsFromJson(jOrderItems,o);}


        updateOrderAtDatabase(o,items);

        response.setStatus(200);
        response.getWriter().append("{ \"id\": " + o.getId() + " }");

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        String Sid = request.getParameter("id");

        Order o = getOrderByID(Sid,response);

        if (o == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeOrderFromDatabase(o);

    }




    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private JsonObject getJsonOrder(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("order");
    }

    private List<Order> getOrdersFromDatabase(String Sid, String SuserId,HttpServletResponse response) throws IOException {

        List<Order> orders = new ArrayList<>();

        // if ID is submitted
        if (isStringNotEmpty(Sid)) {

            Order o = getOrderByID(Sid, response);
            if (o != null) {
                orders.add(o);
                return orders;
            }
        }

        if (isStringNotEmpty(SuserId)) return getOrderByUserId(SuserId,response);

        return getOrders();

    }

    private Order getOrderByID(String Sid, HttpServletResponse response) throws IOException {

        try {
            Integer id = Integer.parseInt(Sid);
            return DatabaseManager.createEntityManager().find(Order.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private List<Order> getOrderByUserId(String SuserId, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(SuserId);

            return DatabaseManager.createEntityManager().createQuery("SELECT o FROM Order o " +
                    " WHERE o.user.id = :userId", Order.class)
                    .setParameter("userId", id)
                    .getResultList();

        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private List<Order> getOrders() {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM Order o", Order.class).getResultList();
    }

    private void removeOrderFromDatabase(Order o) {

        DatabaseManager.createEntityManager().getTransaction().begin();
        o = DatabaseManager.createEntityManager().merge(o);
        DatabaseManager.createEntityManager().remove(o);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }

    private Order createOrderFromJson(JsonObject jOrder) {

        return updateOrderFromJson(jOrder,new Order());
    }

    private Order updateOrderFromJson(JsonObject jOrder, Order o) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        // save params to new user
        o = gson.fromJson(jOrder, Order.class);

        o.setTimeStamp(new Timestamp(System.currentTimeMillis()));

        String method = jOrder.get("method").getAsString();

        switch (method)
        {

            case "Bar":
                o.setMethod(PaymentMethod.Bar);
                break;
            case "Lastschrift":
                o.setMethod(PaymentMethod.Lastschrift);
                break;
            case "Uebrerweisung":
                o.setMethod(PaymentMethod.Ueberweisung);
                break;
            case "Paypal":
                o.setMethod(PaymentMethod.Paypal);
                break;
        }


        return o;
    }

    private void saveOrderToDatabase(Order newOrder,List<OrderedItem> items) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.persist(newOrder);
        for (OrderedItem o: items) {
            em.persist(o);
        }
        for (Size s: updatedSizes){
            em.persist(s);
        }
        em.getTransaction().commit();
    }

    private void updateOrderAtDatabase(Order newOrder,List<OrderedItem> items) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.merge(newOrder);
        for (OrderedItem o: items) {
            em.merge(o);
        }
        for (Size s: updatedSizes){
            em.merge(s);
        }
        em.getTransaction().commit();
    }

    private List<OrderedItem> updateOrderedItemsFromJson(JsonArray jOrderItems,Order o) {
        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        EntityManager em = DatabaseManager.createEntityManager();

        List<OrderedItem> items = new ArrayList<>();

        for (int i = 0; i<jOrderItems.size();++i) {

            JsonObject jItem = jOrderItems.get(i).getAsJsonObject();

            OrderedItem item = new OrderedItem();

              if (jItem.has("id")) {
                  Integer jId = jItem.get("id").getAsInt();

                  item = em.find(OrderedItem.class, jId);
              }

                item = updateOrderedItemFromJson(jItem,item,o);
                items.add(item);



        }

        return items;
    }

    private OrderedItem updateOrderedItemFromJson(JsonObject jItem, OrderedItem item, Order o) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        EntityManager em = DatabaseManager.createEntityManager();

        if (!jItem.has("id")) {
            item = gson.fromJson(jItem,OrderedItem.class);
            // update event,order, color


            item.setEvent(em.find(Event.class,jItem.get("event").getAsJsonObject().get("id").getAsInt()));

            if (jItem.has("color")) {
                Color c = gson.fromJson(jItem.get("color").getAsJsonObject(), Color.class);
                item.setColor(c);

                List<Size> sizes = em.createQuery("SELECT s FROM Size s " +
                        " WHERE s.size = :name AND s.color.hex = :hex", Size.class)
                        .setParameter("name", item.getSize()).setParameter("hex", c.getHex())
                        .getResultList();

                Size size = sizes.get(0);
                size.setAmount(size.getAmount() - 1);
                updatedSizes.add(size);
            }

        }else{

            OrderStatus oldState = item.getStatus();
            item = gson.fromJson(jItem,OrderedItem.class);
            item.setId(jItem.get("id").getAsInt());

            if ((oldState != OrderStatus.Cancelled) && (oldState != OrderStatus.Refused)) {

                if(item.getStatus() == OrderStatus.Cancelled || item.getStatus() == OrderStatus.Refused) {

                    if (item.getColor()!=null) {

                        List<Size> sizes = em.createQuery("SELECT s FROM Size s " +
                                " WHERE s.size = :name AND s.color.hex = :hex", Size.class)
                                .setParameter("name", item.getSize()).setParameter("hex", item.getColor().getHex())
                                .getResultList();

                        Size size = sizes.get(0);
                        size.setAmount(size.getAmount() + 1);
                        updatedSizes.add(size);
                    }
                }
            }

        }

        return item;
    }

    private List<OrderedItem> getOrderedItemsByOrderId(Integer id) {

        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o " +
                " WHERE o.orderId = :Id", OrderedItem.class)
                .setParameter("Id", id)
                .getResultList();

    }

}