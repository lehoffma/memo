package memo;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class DatabaseManager {

	EntityManagerFactory emf;

	private DatabaseManager(){
		emf = Persistence.createEntityManagerFactory("memoPersistence");
	}
	
	public static EntityManager createEntityManager(){

		DatabaseManager dbm = new DatabaseManager();
		EntityManager em = dbm.emf.createEntityManager();
		return em;
	}
}
