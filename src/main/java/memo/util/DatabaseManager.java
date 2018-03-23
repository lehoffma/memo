package memo.util;

import org.apache.log4j.Logger;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.Persistence;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

public class DatabaseManager {

    private static final Logger logger = Logger.getLogger(DatabaseManager.class);

    private static DatabaseManager dbm;
    private EntityManager em;

    private DatabaseManager() {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("memoPersistence");
        em = emf.createEntityManager();
    }

    public static DatabaseManager getInstance() {
        if (dbm == null) dbm = new DatabaseManager();
        return dbm;
    }

    public static EntityManager createEntityManager() {
        if (dbm == null) dbm = new DatabaseManager();
        return dbm.em;
    }


    public <T> T getByStringId(Class<T> clazz, String primaryKey) {
        try {
            logger.trace("Tries to Parse " + primaryKey + " to Integer");
            Integer id = Integer.parseInt(primaryKey);
            return getById(clazz, id);
        } catch (NumberFormatException e) {

            logger.error("Parsing error", e);
        }
        return null;
    }

    /**
     * @param clazz
     * @param primaryKey
     * @param <T>
     * @param <PrimaryKey>
     * @return
     */
    public <T, PrimaryKey> T getById(Class<T> clazz, PrimaryKey primaryKey) {
        logger.debug("Database Query by Id: " + primaryKey + " on Class: " + clazz.getName());
        return performActionOnDb(em -> em.find(clazz, primaryKey));
    }

    /**
     * Persists a single object to the database
     *
     * @param object
     * @param <T>
     */
    public <T> void save(T object) {
        performSideEffectOnDb(em -> em.persist(object));
    }

    /**
     * Persists a list of objects to the database
     *
     * @param objects
     * @param <T>
     */
    public <T> void saveAll(List<T> objects) {
        performSideEffectOnDb(em -> objects.forEach(em::persist));
    }

    /**
     * Merges an object in the database
     *
     * @param object
     * @param <T>
     */
    public <T> T update(T object) {
        return performActionOnDb(em -> em.merge(object));
    }

    /**
     * Merges a list of objects in the database
     *
     * @param objects
     * @param <T>
     */
    public <T> List<T> updateAll(List<T> objects) {
        return performActionOnDb(em -> objects.stream().map(em::merge).collect(Collectors.toList()));
    }

    /**
     * Helper method for remove() and removeAll(). Removes an object from the given database
     *
     * @param em
     * @param object
     * @param <T>
     */
    private <T> void removeObject(EntityManager em, T object) {
        T mergedObject = em.merge(object);
        em.remove(mergedObject);
    }

    /**
     * Removes a single object from the database
     *
     * @param object
     * @param <T>
     */
    public <T> void remove(T object) {
        performSideEffectOnDb(em -> removeObject(em, object));
    }

    /**
     * Removes a list of objects from the database
     *
     * @param objects
     * @param <T>
     */
    public <T> void removeAll(List<T> objects) {
        performSideEffectOnDb(em -> objects.forEach(object -> removeObject(em, object)));
    }

    /**
     * Performs the given action on the database this instance manages.
     * Handles opening and committing the transaction
     *
     * @param action
     */
    public <T> T performActionOnDb(Function<EntityManager, T> action) {

        logger.debug("Performs Database Action: " + action.toString());
        EntityManager em = DatabaseManager.createEntityManager();

        EntityTransaction transaction = em.getTransaction();
        while(transaction.isActive()){
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                logger.error("Thread was interrupted!", e);
                return null;
            }
        }
        transaction.begin();
        T result = action.apply(em);
        transaction.commit();
        return result;
    }

    /**
     * @param consumer
     */
    public void performSideEffectOnDb(Consumer<EntityManager> consumer) {

        logger.debug("Performs Database Side Effect on: " + consumer.toString());
        EntityManager em = DatabaseManager.createEntityManager();
        EntityTransaction transaction = em.getTransaction();
        transaction.begin();
        consumer.accept(em);
        transaction.commit();
    }
}
