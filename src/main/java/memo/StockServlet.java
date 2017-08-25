package memo;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import memo.model.Size;

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


        List<Size> stock = getStockFromDatabase(SeventId, sType, response);


        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(stock);

        response.getWriter().append("{ \"stock\": " + output + " }");
    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private List<Size> getStockFromDatabase(String SeventId, String sType, HttpServletResponse response) throws IOException {

        if (isStringNotEmpty(SeventId)) {
            return getStockByEventId(SeventId, response);
        }

        if (isStringNotEmpty(sType)) {
            Integer type = EventServlet.getType(sType);
            return getStockByEventType(type);
        }
        return getStock();

    }

    private List<Size> getStock() {
        return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Size s ", Size.class)
                .getResultList();
    }

    private List<Size> getStockByEventType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Size s " +
                " WHERE s.event.type = :typ", Size.class)
                .setParameter("typ", type)
                .getResultList();
    }

    private List<Size> getStockByEventId(String SeventId, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(SeventId);
            //ToDo: gibt null aus wenn id nicht vergeben (ich bin für optionals)
            return DatabaseManager.createEntityManager().createQuery("SELECT s FROM Size s " +
                    " WHERE s.event.id = :id", Size.class)
                    .setParameter("id", id)
                    .getResultList();
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }


}
