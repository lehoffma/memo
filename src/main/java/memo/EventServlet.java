package memo;


import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.ClubRole;
import memo.model.Event;

import java.io.IOException;
import java.sql.Timestamp;
import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class EventServlet
 */
@WebServlet("/api/event")
public class EventServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;


    public EventServlet() {super();}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    	request.setCharacterEncoding("UTF-8");
		response.setContentType("application/json;charset=UTF-8");

		String Sid = request.getParameter("id");
		String searchTerm = request.getParameter("searchTerm");
		String type = request.getParameter("type");

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


		// TODO: Inner Objects

		if (jEvent.get("date")!= null)
		newEvent.setDate(new Timestamp(jEvent.get("date").getAsLong()));


		/*
		@ManyToOne(cascade = { CascadeType.REFRESH })
		@JoinColumn(name = "EXPECTED_READ_ROLE", nullable = false)
		private ClubRole expectedReadRole;

		*/

		/* TODO: roles
		if (jEvent.get("expectedRole")!= null){
			newEvent.setExpectedCheckinRole(em.find(ClubRole.class,jEvent.get("expectedRole")));
		}
		*/

		if (jEvent.get("expectedWriteRole")!= null)
			newEvent.setExpectedWriteRole(em.find(ClubRole.class,jEvent.get("expectedWriteRole")));
		/*
		@ManyToOne(cascade = { CascadeType.REFRESH })
		@JoinColumn(name = "EXPECTED_WRITE_ROLE", nullable = false)
		private ClubRole expectedWriteRole;
		*/

		/* TODO: adresses
		@ManyToOne
		@JoinColumn(name = "MEETING_POINT_ID", nullable = false)
		private Address meetingPoint;

		@ManyToOne
		@JoinColumn(name = "DESTINATION_ID")
		private Address destination;
		*/


		em.getTransaction().begin();
		em.persist(newEvent);
		em.getTransaction().commit();
		response.setStatus(201);
		response.getWriter().append("{ id: " + newEvent.getId()+ " }");

		System.out.println(newEvent.toString());

	}
}
