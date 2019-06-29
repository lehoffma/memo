package memo.discounts.data;

import memo.data.AbstractPagingAndSortingRepository;
import memo.data.Repository;
import memo.data.util.PredicateFactory;
import memo.discounts.auth.DiscountAuthStrategy;
import memo.discounts.model.DiscountEntity;
import memo.model.ClubRole;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.DatabaseManager;
import memo.util.model.EventType;
import memo.util.model.Filter;
import memo.util.model.Page;
import memo.util.model.PageRequest;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Named
@ApplicationScoped
public class DiscountRepository extends AbstractPagingAndSortingRepository<DiscountEntity> implements Repository<DiscountEntity> {
    public DiscountRepository() {
        super(DiscountEntity.class);
    }


    @Inject
    public DiscountRepository(DiscountAuthStrategy authStrategy) {
        super(DiscountEntity.class, authStrategy);
    }


    private TypedQuery<DiscountEntity> getPossibilitiesQuery(String selectString,
                                                             ClubRole clubRole, Integer itemId, Integer itemMiles, BigDecimal itemPrice,
                                                             Long userAgeInYears, Long membershipInDays, Integer itemType, Integer userId) {
        //returns all discounts that apply to the item, but not the user (for whatever reason)
        return DatabaseManager.createEntityManager()
                .createQuery(
                        "SELECT " + selectString + " \n" +
                                "FROM DiscountEntity discount LEFT JOIN" +
                                "     discount.items as items LEFT JOIN" +
                                "     discount.clubRoles as clubRoles LEFT JOIN" +
                                "     discount.itemTypes as itemTypes LEFT JOIN" +
                                "     discount.users as users\n" +
                                "WHERE (discount.discountStart IS NULL OR discount.discountStart <= CURRENT_DATE) " +
                                "   AND (discount.discountEnd IS NULL OR discount.discountEnd >= CURRENT_DATE)" +
                                //item conditions
                                "   AND (discount.minPrice IS NULL OR (:itemPrice IS NOT NULL AND discount.minPrice <= :itemPrice))" +
                                "   AND (discount.maxPrice IS NULL OR (:itemPrice IS NOT NULL AND discount.maxPrice >= :itemPrice))" +
                                "   AND (discount.minMiles IS NULL OR (:itemMiles IS NOT NULL AND discount.minMiles <= :itemMiles))" +
                                "   AND (discount.maxMiles IS NULL OR (:itemMiles IS NOT NULL AND discount.maxMiles >= :itemMiles))" +
                                "   AND (discount.items IS EMPTY OR (:itemId IS NOT NULL AND EXISTS(SELECT item from discount.items item WHERE item.id = :itemId)))" +
                                "   AND (discount.itemTypes IS EMPTY OR (:itemType IS NOT NULL AND :itemType MEMBER OF discount.itemTypes))" +

                                "   AND ((discount.minAge IS NOT NULL AND (:userAge IS NOT NULL AND discount.minAge > :userAge))" +
                                "   OR (discount.maxAge IS NOT NULL AND (:userAge IS NOT NULL AND discount.maxAge < :userAge))" +
                                "   OR (discount.minMembershipDurationInDays IS NOT NULL AND (:userMembershipDays IS NOT NULL AND discount.minMembershipDurationInDays > :userMembershipDays))" +
                                "   OR (discount.maxMembershipDurationInDays IS NOT NULL AND (:userMembershipDays IS NOT NULL AND discount.maxMembershipDurationInDays < :userMembershipDays))" +
                                "   OR (discount.clubRoles IS NOT EMPTY AND :clubRole IS NOT NULL AND :clubRole NOT MEMBER OF discount.clubRoles)" +
                                "   OR (discount.users IS NOT EMPTY AND :userId IS NOT NULL AND NOT EXISTS(SELECT user from discount.users user WHERE user.id = :userId)))" +
                                "   ",
                        DiscountEntity.class)
                .setParameter("clubRole", clubRole)
                .setParameter("itemId", itemId)
                .setParameter("itemMiles", itemMiles)
                .setParameter("itemPrice", itemPrice)
                .setParameter("itemType", itemType)
                .setParameter("userAge", userAgeInYears)
                .setParameter("userId", userId)
                .setParameter("userMembershipDays", membershipInDays);
    }

    private TypedQuery<DiscountEntity> getQuery(String selectString,
                                                ClubRole clubRole, Integer itemId, Integer itemMiles, BigDecimal itemPrice,
                                                Long userAgeInYears, Long membershipInDays, Integer itemType, Integer userId) {
        //todo work limit into the query
        return DatabaseManager.createEntityManager()
                .createQuery(
                        "SELECT " + selectString + " \n" +
                                "FROM DiscountEntity discount LEFT JOIN" +
                                "     discount.items as items LEFT JOIN" +
                                "     discount.clubRoles as clubRoles LEFT JOIN" +
                                "     discount.itemTypes as itemTypes LEFT JOIN" +
                                "     discount.users as users\n" +
                                "WHERE (discount.discountStart IS NULL OR discount.discountStart <= CURRENT_DATE) " +
                                "   AND (discount.discountEnd IS NULL OR discount.discountEnd >= CURRENT_DATE)" +
                                //item conditions
                                "   AND (discount.minPrice IS NULL OR (:itemPrice IS NOT NULL AND discount.minPrice <= :itemPrice))" +
                                "   AND (discount.maxPrice IS NULL OR (:itemPrice IS NOT NULL AND discount.maxPrice >= :itemPrice))" +
                                "   AND (discount.minMiles IS NULL OR (:itemMiles IS NOT NULL AND discount.minMiles <= :itemMiles))" +
                                "   AND (discount.maxMiles IS NULL OR (:itemMiles IS NOT NULL AND discount.maxMiles >= :itemMiles))" +
                                "   AND (discount.items IS EMPTY OR (:itemId IS NOT NULL AND EXISTS(SELECT item from discount.items item WHERE item.id = :itemId)))" +
                                "   AND (discount.itemTypes IS EMPTY OR (:itemType IS NOT NULL AND :itemType MEMBER OF discount.itemTypes))" +
                                //user conditions
                                "   AND (discount.minAge IS NULL OR (:userAge IS NOT NULL AND discount.minAge <= :userAge))" +
                                "   AND (discount.maxAge IS NULL OR (:userAge IS NOT NULL AND discount.maxAge >= :userAge))" +
                                "   AND (discount.minMembershipDurationInDays IS NULL OR (:userMembershipDays IS NOT NULL AND discount.minMembershipDurationInDays <= :userMembershipDays))" +
                                "   AND (discount.maxMembershipDurationInDays IS NULL OR (:userMembershipDays IS NOT NULL AND discount.maxMembershipDurationInDays >= :userMembershipDays))" +
                                "   AND (discount.clubRoles IS empty OR (:clubRole IS NOT NULL AND :clubRole MEMBER OF discount.clubRoles))" +
                                "   AND (discount.users IS EMPTY OR (:userId IS NOT NULL AND EXISTS(SELECT user from discount.users user WHERE user.id = :userId)))" +
                                "   ",
                        DiscountEntity.class)
                .setParameter("clubRole", clubRole)
                .setParameter("itemId", itemId)
                .setParameter("itemMiles", itemMiles)
                .setParameter("itemPrice", itemPrice)
                .setParameter("itemType", itemType)
                .setParameter("userAge", userAgeInYears)
                .setParameter("userId", userId)
                .setParameter("userMembershipDays", membershipInDays);
    }


    public Page<DiscountEntity> getDiscounts(User user, PageRequest pageRequest) {
        return this.getDiscounts(null, user, pageRequest);
    }

    public Page<DiscountEntity> getDiscounts(ShopItem item, PageRequest pageRequest) {
        return this.getDiscounts(item, null, pageRequest);
    }

    public Page<DiscountEntity> getDiscounts(PageRequest pageRequest) {
        return this.getDiscounts(null, null, pageRequest);
    }

    @FunctionalInterface
    public interface DiscountQuerySupplier {
        TypedQuery<DiscountEntity> get(
                ClubRole clubRole, Integer itemId, Integer itemMiles, BigDecimal itemPrice,
                Long userAgeInYears, Long membershipInDays, Integer itemType, Integer userId
        );
    }

    private Page<DiscountEntity> getDiscounts(ShopItem item,
                                              User user,
                                              PageRequest pageRequest,
                                              DiscountQuerySupplier querySupplier,
                                              DiscountQuerySupplier countQuerySupplier
    ) {
        ClubRole clubRole = Optional.ofNullable(user).map(User::getClubRole).orElse(null);
        Integer itemId = Optional.ofNullable(item).map(ShopItem::getId).orElse(null);
        Integer itemMiles = Optional.ofNullable(item)
                .filter(it -> it.getType() == EventType.tours.getValue())
                .map(ShopItem::getMiles)
                .orElse(null);
        BigDecimal itemPrice = Optional.ofNullable(item).map(ShopItem::getPrice).orElse(null);
        Integer itemType = Optional.ofNullable(item).map(ShopItem::getType).orElse(null);

        Long userAgeInYears = Optional.ofNullable(user)
                .map(User::getBirthday)
                .map(it -> ChronoUnit.YEARS.between(it.toLocalDate(), LocalDate.now()))
                .orElse(null);

        Integer userId = Optional.ofNullable(user).map(User::getId).orElse(null);

        Long membershipInDays = Optional.ofNullable(user)
                .map(User::getJoinDate)
                .map(it -> ChronoUnit.DAYS.between(it.toLocalDate(), LocalDate.now()))
                .orElse(null);

        TypedQuery<DiscountEntity> query = querySupplier.get(clubRole, itemId, itemMiles, itemPrice,
                userAgeInYears, membershipInDays, itemType, userId);

        TypedQuery<DiscountEntity> countQuery = countQuerySupplier.get(clubRole, itemId, itemMiles,
                itemPrice, userAgeInYears, membershipInDays, itemType, userId);

        return Page.fromQuery(
                query,
                countQuery,
                pageRequest
        );
    }

    public Page<DiscountEntity> getDiscountPossibilities(ShopItem item, User user, PageRequest pageRequest) {
        if (user == null) {
            return new Page<>();
        }

        return this.getDiscounts(
                item, user, pageRequest,
                (clubRole, itemId, itemMiles, itemPrice, userAgeInYears, membershipInDays, itemType, userId) ->
                        this.getPossibilitiesQuery(
                                "DISTINCT discount",
                                clubRole, itemId, itemMiles, itemPrice, userAgeInYears, membershipInDays, itemType, userId
                        ),
                (clubRole, itemId, itemMiles, itemPrice, userAgeInYears, membershipInDays, itemType, userId) ->
                        this.getPossibilitiesQuery(
                                "count(DISTINCT discount)",
                                clubRole, itemId, itemMiles, itemPrice, userAgeInYears, membershipInDays, itemType, userId
                        )
        );
    }

    public Page<DiscountEntity> getDiscounts(ShopItem item, User user, PageRequest pageRequest) {
        return this.getDiscounts(
                item, user, pageRequest,
                (clubRole, itemId, itemMiles, itemPrice, userAgeInYears, membershipInDays, itemType, userId) ->
                        this.getQuery(
                                "DISTINCT discount",
                                clubRole, itemId, itemMiles, itemPrice, userAgeInYears, membershipInDays, itemType, userId
                        ),
                (clubRole, itemId, itemMiles, itemPrice, userAgeInYears, membershipInDays, itemType, userId) ->
                        this.getQuery(
                                "count(DISTINCT discount)",
                                clubRole, itemId, itemMiles, itemPrice, userAgeInYears, membershipInDays, itemType, userId
                        )
        );
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<DiscountEntity> root, Filter.FilterRequest filterRequest) {
        //todo
        return PredicateFactory.fromFilter(builder, root, filterRequest);
    }

    @Override
    public List<DiscountEntity> getAll() {
        return DatabaseManager.createEntityManager()
                .createQuery("SELECT d FROM DiscountEntity d", DiscountEntity.class)
                .getResultList();
    }
}
