package memo.discounts.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.model.ClubRole;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.model.User;
import memo.serialization.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;


//todo discount refactor add color/sizes?
@Entity
@Table(name = "Discounts")
public class DiscountEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal amount;

    //discounts can be either percentage-based or absolute values
    @Column(nullable = false)
    private Boolean isPercentage;

    //discounts cannot be deleted, they can only become outdated
    //at which point they cannot apply on anything anymore and are hidden from the usual discount creation table
    //time-based discounts should become outdated as soon as their time runs out (java scheduled job should be able to do that)
    private Boolean outdated;

    private Integer limitPerUserAndItem;

    //a link for the user to become eligible (e.g. for the membership discount)
    //show link: linkUrl !== null && linkText !== null
    private String linkUrl;
    private String linkText;

    private String reason;

    @ManyToMany(mappedBy = "discounts")
    private List<OrderedItem> orderedItems;

    //user restrictions
    //
    //    UserIdList,
    @OneToMany(fetch = FetchType.EAGER)
    @JsonSerialize(using = UserIdListSerializer.class)
    @JsonDeserialize(using = UserIdListDeserializer.class)
    private List<User> users;

    //    Birthday,
    private Integer minAge = null;
    private Integer maxAge = null;
    //    JoinDate,
    private Integer minMembershipDurationInDays = null;
    private Integer maxMembershipDurationInDays = null;
    //    ClubRole,
    @ElementCollection
    @Enumerated
    @JsonDeserialize(using = ClubRoleListDeserializer.class)
    private List<ClubRole> clubRoles;
    //    IsWoelfeClubMember,
    private Boolean woelfeClubMembership = null;
    //    HasSeasonTicket,
    private Boolean seasonTicket = null;
    //    IsStudent,
    private Boolean isStudent = null;


    //    ItemIdList,

    @OneToMany(fetch = FetchType.LAZY)
    @JsonSerialize(using = ShopItemIdListSerializer.class)
    @JsonDeserialize(using = ShopItemIdListDeserializer.class)
    private List<ShopItem> items;
    //    ItemDate,
    private Date discountStart = null;
    private Date discountEnd = null;
    //    ItemPrice,
    private BigDecimal minPrice = null;
    private BigDecimal maxPrice = null;
    //    ItemType,
    @ElementCollection
    private List<Integer> itemTypes;
    //    ItemMiles
    private BigDecimal minMiles = null;
    private BigDecimal maxMiles = null;

    @JsonIgnore
    public List<OrderedItem> getOrderedItems() {
        return orderedItems;
    }

    //todo
    @JsonIgnore
    public DiscountEntity setOrderedItems(List<OrderedItem> orderedItems) {
        this.orderedItems = orderedItems;
        return this;
    }

    public Integer getLimitPerUserAndItem() {
        return limitPerUserAndItem;
    }

    public DiscountEntity setLimitPerUserAndItem(Integer limitPerUserAndItem) {
        this.limitPerUserAndItem = limitPerUserAndItem;
        return this;
    }

    public Long getId() {
        return id;
    }

    public DiscountEntity setId(Long id) {
        this.id = id;
        return this;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public DiscountEntity setAmount(BigDecimal amount) {
        this.amount = amount;
        return this;
    }

    public Boolean getPercentage() {
        return isPercentage;
    }

    public DiscountEntity setPercentage(Boolean percentage) {
        isPercentage = percentage;
        return this;
    }

    public Boolean getOutdated() {
        return outdated;
    }

    public DiscountEntity setOutdated(Boolean outdated) {
        this.outdated = outdated;
        return this;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public DiscountEntity setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
        return this;
    }

    public String getLinkText() {
        return linkText;
    }

    public DiscountEntity setLinkText(String linkText) {
        this.linkText = linkText;
        return this;
    }

    public String getReason() {
        return reason;
    }

    public DiscountEntity setReason(String reason) {
        this.reason = reason;
        return this;
    }

    public List<User> getUsers() {
        return users;
    }

    public DiscountEntity setUsers(List<User> users) {
        this.users = users;
        return this;
    }

    public Integer getMinAge() {
        return minAge;
    }

    public DiscountEntity setMinAge(Integer minAge) {
        this.minAge = minAge;
        return this;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public DiscountEntity setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
        return this;
    }

    public Integer getMinMembershipDurationInDays() {
        return minMembershipDurationInDays;
    }

    public DiscountEntity setMinMembershipDurationInDays(Integer minMembershipDurationInDays) {
        this.minMembershipDurationInDays = minMembershipDurationInDays;
        return this;
    }

    public Integer getMaxMembershipDurationInDays() {
        return maxMembershipDurationInDays;
    }

    public DiscountEntity setMaxMembershipDurationInDays(Integer maxMembershipDurationInDays) {
        this.maxMembershipDurationInDays = maxMembershipDurationInDays;
        return this;
    }

    public List<ClubRole> getClubRoles() {
        return clubRoles;
    }

    public DiscountEntity setClubRoles(List<ClubRole> clubRoles) {
        this.clubRoles = clubRoles;
        return this;
    }

    public Boolean getWoelfeClubMembership() {
        return woelfeClubMembership;
    }

    public DiscountEntity setWoelfeClubMembership(Boolean woelfeClubMembership) {
        this.woelfeClubMembership = woelfeClubMembership;
        return this;
    }

    public Boolean getSeasonTicket() {
        return seasonTicket;
    }

    public DiscountEntity setSeasonTicket(Boolean seasonTicket) {
        this.seasonTicket = seasonTicket;
        return this;
    }

    public Boolean getStudent() {
        return isStudent;
    }

    public DiscountEntity setStudent(Boolean student) {
        isStudent = student;
        return this;
    }

    public List<ShopItem> getItems() {
        return items;
    }

    public DiscountEntity setItems(List<ShopItem> items) {
        this.items = items;
        return this;
    }

    public Date getDiscountStart() {
        return discountStart;
    }

    public DiscountEntity setDiscountStart(Date discountStart) {
        this.discountStart = discountStart;
        return this;
    }

    public Date getDiscountEnd() {
        return discountEnd;
    }

    public DiscountEntity setDiscountEnd(Date discountEnd) {
        this.discountEnd = discountEnd;
        return this;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }

    public DiscountEntity setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
        return this;
    }

    public BigDecimal getMaxPrice() {
        return maxPrice;
    }

    public DiscountEntity setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
        return this;
    }

    public List<Integer> getItemTypes() {
        return itemTypes;
    }

    public DiscountEntity setItemTypes(List<Integer> itemTypes) {
        this.itemTypes = itemTypes;
        return this;
    }

    public BigDecimal getMinMiles() {
        return minMiles;
    }

    public DiscountEntity setMinMiles(BigDecimal minMiles) {
        this.minMiles = minMiles;
        return this;
    }

    public BigDecimal getMaxMiles() {
        return maxMiles;
    }

    public DiscountEntity setMaxMiles(BigDecimal maxMiles) {
        this.maxMiles = maxMiles;
        return this;
    }
}
