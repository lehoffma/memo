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
import java.util.ArrayList;
import java.util.List;

@WebServlet(name = "StockServlet", value = "/api/stock")
public class StockServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        String SeventId = request.getParameter("eventId");
        String sType = request.getParameter("type");


        List<Size> stock = new ArrayList<>();


        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(stock);

        response.getWriter().append("{ \"stock\": " + output + " }");
    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

}
