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

    private static ThreadLocal<DatabaseManager> threadedDatabaseManager;

    private static EntityManagerFactory emf;

    private DatabaseManager() {
    }

    public static DatabaseManager getInstance() {
        if (threadedDatabaseManager == null) {
            threadedDatabaseManager = ThreadLocal.withInitial(DatabaseManager::new);
        }
        return threadedDatabaseManager.get();
    }

    public static EntityManager createEntityManager() {
        if (emf == null) {
            emf = Persistence.createEntityManagerFactory("memoPersistence");
        }
        return emf.createEntityManager();
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
    public <T> void save(T object, Class<T> clazz) {
        performSideEffectOnDb(em -> em.persist(object), clazz);
    }

    /**
     * Persists a list of objects to the database
     *
     * @param objects
     * @param <T>
     */
    public <T> void saveAll(List<T> objects, Class<T> clazz) {
        performSideEffectOnDb(em -> objects.forEach(em::persist), clazz);
    }

    /**
     * Merges an object in the database
     *
     * @param object
     * @param <T>
     */
    public <T> T update(T object, Class<T> clazz) {
        return performActionOnDb(em -> em.merge(object), clazz);
    }

    /**
     * Merges a list of objects in the database
     *
     * @param objects
     * @param <T>
     */
    public <T> List<T> updateAll(List<T> objects, Class<T> clazz) {
        return performActionOnDb(em -> objects.stream().map(em::merge).collect(Collectors.toList()), clazz);
    }

    /**
     * Helper method for remove() and removeAll(). Removes an object from the given database
     *
     * @param em
     * @param object
     * @param <T>
     */
    private <T> void removeObject(EntityManager em, T object) {
        if (!em.contains(object)) {
            object = em.merge(object);
        }
        em.remove(object);
    }

    /**
     * Removes a single object from the database and clears the cache for the given class.
     *
     * @param object
     * @param <T>
     */
    public <T> void remove(T object, Class<T> clazz) {
        performSideEffectOnDb(em -> removeObject(em, object), clazz);
    }

    /**
     * Removes a list of objects from the database
     *
     * @param objects
     * @param <T>
     */
    public <T> void removeAll(List<T> objects, Class<T> clazz) {
        performSideEffectOnDb(em -> objects.forEach(object -> removeObject(em, object)), clazz);
    }

    /**
     * Performs the given action on the database this instance manages.
     * Handles opening and committing the transaction.
     * Doesn't evict the cache after performing the action
     */
    private <T> T performActionOnDb(Function<EntityManager, T> action) {
        return performActionOnDb(action, null);
    }

    /**
     * Performs the given action on the database this instance manages.
     * Handles opening and committing the transaction
     * If classToEvict is specified, the cache for that class is evicted
     */
    private <T, U> T performActionOnDb(Function<EntityManager, T> action, Class<U> classToEvict) {
        logger.debug("Performs Database Action: " + action.toString());
        EntityManager em = createEntityManager();

        EntityTransaction transaction = em.getTransaction();
        transaction.begin();

        T result = action.apply(em);
        if (classToEvict != null) {
            em.getEntityManagerFactory().getCache().evict(classToEvict);
        }

        transaction.commit();
        return result;
    }

    /**
     * Performs the given side effect on the database this instance manages.
     * Handles opening and committing the transaction
     * If classToEvict is specified, the cache for that class is evicted
     */
    private void performSideEffectOnDb(Consumer<EntityManager> consumer) {
        this.performSideEffectOnDb(consumer, null);
    }

    /**
     * Performs the given side effect on the database this instance manages.
     * Handles opening and committing the transaction
     * If classToEvict is specified, the cache for that class is evicted
     */
    private <T> void performSideEffectOnDb(Consumer<EntityManager> consumer, Class<T> classToEvict) {
        logger.debug("Performs Database Side Effect on: " + consumer.toString());
        EntityManager em = createEntityManager();

        EntityTransaction transaction = em.getTransaction();
        transaction.begin();

        consumer.accept(em);
        if (classToEvict != null) {
            em.getEntityManagerFactory().getCache().evict(classToEvict);
        }

        transaction.commit();
    }
}
