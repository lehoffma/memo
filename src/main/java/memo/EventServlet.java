package memo;


import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.*;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class EventServlet
 */
@WebServlet(name = "EventServlet",value = "/api/event")
public class EventServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;


    public EventServlet() {super();}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    	request.setCharacterEncoding("UTF-8");
		response.setContentType("application/json;charset=UTF-8");

		String Sid = request.getParameter("id");
		String searchTerm = request.getParameter("searchTerm");
		String sType = request.getParameter("type");


        List<Event> results = new ArrayList<>();
        List<Size> sizeList = new ArrayList<>();
        List<SizeTable> sizeTableList = new ArrayList<>();


        EntityManager em = DatabaseManager.createEntityManager();

        if(Sid != null && !Sid.isEmpty())
        {
            Integer id = Integer.parseInt(Sid);
            // Find by ID
            results.add(em.find(Event.class,id));

        }
        else {
            if (searchTerm != null && !searchTerm.isEmpty()) {
                if (sType != null && !sType.isEmpty()) {
                    // searchTerm & Type


                    Integer type = 0;

                    switch (sType)
                    {
                        case "tours":
                            type = 1;
                            break;
                        case "partys":
                            type = 3;
                            break;
                        case "merch":
                            type = 2;
                            break;

                    }

                    results = em.createQuery("SELECT e FROM Event e WHERE e.type = :typ AND UPPER(e.title LIKE UPPER(:searchTerm) OR UPPER(e.description) LIKE UPPER(:searchTerm)", Event.class)
                            .setParameter("searchTerm","%"+ searchTerm + "%").setParameter("typ",type).getResultList();

                } else {

                    // only search term
                    results = em.createQuery("SELECT e FROM Event e WHERE UPPER(e.title LIKE UPPER(:searchTerm) OR UPPER(e.description) LIKE UPPER(:searchTerm)", Event.class)
                            .setParameter("searchTerm","%"+ searchTerm + "%").getResultList();

                }


            } else {
                if (sType != null && !sType.isEmpty()) {
                    //  Type

                    Integer type = 0;

                    switch (sType)
                    {
                        case "tours":
                            type = 1;
                            break;
                        case "merch":
                            type = 2;
                            break;
                        case "partys":
                            type = 3;
                            break;

                    }

                    results = em.createQuery("SELECT e FROM Event e WHERE e.type = :typ", Event.class).setParameter("typ",type).getResultList();

                }else {
                    // get all
                    results = em.createQuery("SELECT e FROM Event e", Event.class).getResultList();

                }
            }
        }
/*
        // Load Dependencies
        for (Event e: results) {
            sizeList = em.createQuery("SELECT s FROM Size s WHERE s.event.id = :eventID",Size.class).setParameter("eventID",e.getId()).getResultList();
            for (Size s: sizeList){
                sizeTableList = em.createQuery("select t from SizeTable t WHERE t.size.id = :sizeID",SizeTable.class).setParameter("sizeID",s.getId()).getResultList();

            }
        }
*/
        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(results);

        response.getWriter().append("{ \"events\": "+ output +" }");


	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");

		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();


		String body = CharStreams.toString(request.getReader());

		JsonElement jElement = new JsonParser().parse(body);
		JsonObject jEvent = jElement.getAsJsonObject().getAsJsonObject("event");

		Integer id = jEvent.get("id").getAsInt();
		EntityManager em = DatabaseManager.createEntityManager();





		if (id>0)
		{
			Event e = em.find(Event.class,id);
			if (e!=null)
			{
				response.setStatus(400);
				response.getWriter().append("Id is already Taken. Update with PUT");
				return;
			}
		}

		Event newEvent = gson.fromJson(jEvent,Event.class);


		if (jEvent.has("date"))
		newEvent.setDate(new Timestamp(jEvent.get("date").getAsLong()));



        List<Color> colorList = new ArrayList<>();
        List<Size> sizeList = new ArrayList<>();
        List<SizeTable> sizeTableList = new ArrayList<>();
        List<Participates> participatesList = new ArrayList<>();

		if (newEvent.getType()==3)
        {
            JsonArray stock = jEvent.getAsJsonArray("stock");
            JsonArray colors = jEvent.getAsJsonArray("colors");
            JsonObject sizeTable = jEvent.getAsJsonObject("_sizeTable");
            JsonArray sizes = jEvent.getAsJsonArray("sizes");



            // get Color List
            for (int i=0;i<colors.size();++i)
            {
                JsonObject c = colors.get(i).getAsJsonObject();
                if (!c.has("hex"))
                {
                    response.setStatus(400);
                    response.getWriter().append("Wrong color Format! Provide a HEX value");
                    return;
                }
                else
                {
                    String name = c.get("name").getAsString();
                    String hex = c.get("hex").getAsString();

                    List<Color> l = em.createQuery("SELECT c FROM Color c " +
                            " WHERE c.HexCode = :hex",Color.class).setParameter("hex",hex).getResultList();
                    if (!(l.size()>0))
                    {
                        Color x = new Color(name,hex);
                        colorList.add(x);
                    }
                }
            }

            for (int i=0;i<stock.size();++i)
            {
                JsonObject s = stock.get(i).getAsJsonObject();
                String name = s.get("size").getAsString();
                Integer num = s.get("amount").getAsInt();
                String hex = s.get("color").getAsJsonObject().get("hex").getAsString();
                Color color = new Color();
                for (Color j: colorList) {
                    if (j.getHexCode().equals(hex))
                    {
                        color = j;
                        break;
                    }
                }

                Size size = new Size(newEvent,name,num,color);
                sizeList.add(size);

                JsonArray table = sizeTable.getAsJsonArray(size.getName());
                for (int j =0;j<table.size();++j) {
                    JsonObject tb = table.get(j).getAsJsonObject();
                    name = tb.get("name").getAsString();
                    Integer min = tb.get("min").getAsInt();
                    Integer max = tb.get("max").getAsInt();
                    SizeTable t = new SizeTable(size, name, min, max);
                    sizeTableList.add(t);
                }

            }

        }
        else
        {
            JsonArray participants =jEvent.getAsJsonArray("participants");
            for (int i=0;i<participants.size();++i)
            {
                JsonObject p = participants.get(i).getAsJsonObject();
                Integer userID = p.get("id").getAsInt();
                User user = em.find(User.class,userID);
                Boolean isDriver = false;
                Integer paymentState = 0;
                Integer numOfTickets = 1;
                Integer numOfParticipants = 1;
                String comment = "";
                boolean isAuthor = false;
                if(p.has("isDriver")) isDriver= p.get("isDriver").getAsBoolean();
                if(p.has("hasPayed")) paymentState = p.get("hasPayed").getAsBoolean() ? 1:0;
                if(p.has("numOfTickets")) numOfTickets = p.get("numOfTickets").getAsInt();
                if(p.has("numOfParticipants")) numOfParticipants = p.get("numOfParticipants").getAsInt();
                if(p.has("comment")) comment = p.get("comment").getAsString();


                Participates par = new Participates(user,newEvent,isDriver,paymentState,numOfTickets,numOfParticipants,comment,isAuthor);
                participatesList.add(par);

            }

        }



        em.getTransaction().begin();
		em.persist(newEvent);
        for (Color i: colorList) em.persist(i);
        for (Size i: sizeList) em.persist(i);
        for (SizeTable i: sizeTableList) em.persist(i);
        for (Participates i: participatesList) em.persist(i);

        em.getTransaction().commit();
		response.setStatus(201);
		response.getWriter().append("{ \"id\": " + newEvent.getId()+ " }");


	}

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();


        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        JsonObject jEvent = jElement.getAsJsonObject().getAsJsonObject("event");

        Integer id = jEvent.get("id").getAsInt();
        EntityManager em = DatabaseManager.createEntityManager();

        if (!(id>0))
        {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }
            Event e = em.find(Event.class,id);
            if (e==null)
            {
                response.setStatus(404);
                response.getWriter().append("Not Found");
                return;
            }
        em.getTransaction().begin();
            e = gson.fromJson(jEvent,Event.class);


        if (jEvent.has("date"))
            e.setDate(new Timestamp(jEvent.get("date").getAsLong()));


        em.persist(e);
        em.getTransaction().commit();
        response.setStatus(200);
        response.getWriter().append("{ \"id\": " + e.getId()+ " }");
        }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String Sid = request.getParameter("id");


        Event e;
        try {
            Integer id = Integer.parseInt(Sid);
            e = DatabaseManager.createEntityManager().find(Event.class,id);


        }
        catch (NumberFormatException ex){
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
            return;
        }

        if (e==null)
        {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        DatabaseManager.createEntityManager().getTransaction().begin();
        e = DatabaseManager.createEntityManager().merge(e);
        DatabaseManager.createEntityManager().remove(e);
        DatabaseManager.createEntityManager().getTransaction().commit();


    }


    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }


}
