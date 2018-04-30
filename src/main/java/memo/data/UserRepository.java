package memo.data;

import memo.auth.BCryptHelper;
import memo.auth.api.strategy.UserAuthStrategy;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.model.*;
import memo.util.Configuration;
import memo.util.DatabaseManager;
import memo.util.MapBuilder;
import memo.util.model.Filter;
import org.apache.log4j.Logger;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.ListJoin;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.Metamodel;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

public class UserRepository extends AbstractPagingAndSortingRepository<User> {
    private static final Logger logger = Logger.getLogger(UserRepository.class);
    private static UserRepository instance;

    private UserRepository() {
        super(User.class, new UserAuthStrategy());
        this.getAdmin();
    }

    public static UserRepository getInstance() {
        if (instance == null) instance = new UserRepository();
        return instance;
    }

    /**
     * Converts the given string into a ClubRole enum value.
     *
     * @param value the value to convert
     * @return the ClubRole value corresponding to the given string, empty if none is found
     */
    public static Optional<ClubRole> clubRoleFromString(String value) {
        return Arrays.stream(ClubRole.values())
                .filter(it -> it.toString().equalsIgnoreCase(value))
                .findFirst();
    }


    public User getUserByID(String id) throws NumberFormatException {
        return getUserByID(Integer.parseInt(id));
    }

    public User getUserByID(Integer id) throws NumberFormatException {
        //ToDo: gibt null aus wenn id nicht vergeben
        return DatabaseManager.createEntityManager().find(User.class, id);
    }

    public List<User> findByEmail(String email) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("User.findByEmail", User.class)
                .setParameter("email", email)
                .getResultList();
    }

    public List<User> findBySearchTerm(String searchTerm) {
        return DatabaseManager.createEntityManager()
                .createNamedQuery("User.findBySearchTerm", User.class)
                .setParameter("searchTerm", "%" + searchTerm + "%")
                .getResultList();
    }

    public List<User> findByOrderedItemId(String orderedItemId) {
        Integer id = Integer.valueOf(orderedItemId);
        return DatabaseManager.createEntityManager()
                .createNamedQuery("User.findByOrderedItemId", User.class)
                .setParameter("orderedItemId", id)
                .getResultList();
    }


    public List<User> get(String userId, String email, String searchTerm, String participantId) {
        return this.getIf(
                new MapBuilder<String, Function<String, List<User>>>()
                        .buildPut(userId, this::get)
                        .buildPut(email, this::findByEmail)
                        .buildPut(searchTerm, this::findBySearchTerm)
                        .buildPut(participantId, this::findByOrderedItemId),
                this.getAll()
        );
    }

    /**
     * @return
     */
    public User getAdmin() {
        String email = Configuration.get("admin.email");
        String password = Configuration.get("admin.password");
        List<User> userList = this.findByEmail(email);

        logger.trace("Querying admin user with email = " + email);
        if (userList.isEmpty()) {
            User admin = new User();
            admin.setFirstName("Meilenwoelfe");
            admin.setSurname("Admin");
            admin.setGender("Keine Angabe");
            admin.setEmail(email);
            String hashedPassword = BCryptHelper.hashPassword(password);
            admin.setPassword(hashedPassword);
            admin.setJoinDate(new java.sql.Date(new java.util.Date().getTime()));
            admin.setBirthday(new java.sql.Date(new java.util.Date().getTime()));
            admin.setPermissions(new PermissionState(ClubRole.Admin));
            admin.setClubRole(ClubRole.Admin);

            logger.trace("Creating admin user with email = " + email);
            DatabaseManager.getInstance().save(admin, User.class);
            userList = this.findByEmail(email);
        }
        return userList.get(0);
    }

    @Override
    public List<User> getAll() {
        return DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u", User.class).getResultList();
    }

    public List<Predicate> getByParticipantId(CriteriaBuilder builder,
                                              Root<User> root,
                                              Filter.FilterRequest filterRequest) {
        /*
               SELECT distinct u from Order o JOIN o.user u JOIN o.items i WHERE i.id = :orderedItemId
         */
        EntityManager em = DatabaseManager.createEntityManager();
        Metamodel metamodel = em.getMetamodel();
        EntityType<Order> orderEntityType = metamodel.entity(Order.class);
        EntityType<User> userEntityType = metamodel.entity(User.class);

        ListJoin<User, Order> orderJoin = root
                .join(userEntityType.getList("orders", Order.class));
        ListJoin<Order, OrderedItem> orderedItemJoin = orderJoin
                .join(orderEntityType.getList("items", OrderedItem.class));

        List<Predicate> orderedItemIdPredicates = filterRequest.getValues().stream()
                .map(value -> builder.equal(orderedItemJoin.get("id"), value))
                .collect(Collectors.toList());

        return Collections.singletonList(PredicateFactory.combineByOr(builder, orderedItemIdPredicates));
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder,
                                      Root<User> root,
                                      Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest, new PredicateSupplierMap<User>()
                .buildPut("searchTerm",
                        (b, r, filter) -> PredicateFactory.search(b, r, filter, Arrays.asList(
                                "firstName", "surname"
                        )))
                .buildPut("participantId", this::getByParticipantId)
        );
    }
}
