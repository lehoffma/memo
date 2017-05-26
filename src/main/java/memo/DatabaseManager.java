package memo;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class DatabaseManager {

	private static DatabaseManager dbm;
	private EntityManager em;

	private DatabaseManager(){
		EntityManagerFactory emf = Persistence.createEntityManagerFactory("memoPersistence");
		em = emf.createEntityManager();
	}
	
	public static EntityManager createEntityManager(){

		if (dbm==null) dbm = new DatabaseManager();
		return dbm.em;
	}
}
