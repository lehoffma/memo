create table colors
(
    ID int auto_increment
        primary key,
    HEX varchar(255) not null,
    NAME varchar(255) not null
);

create table discounts
(
    ID bigint auto_increment
        primary key,
    AMOUNT decimal(38) not null,
    DISCOUNTEND date null,
    DISCOUNTSTART date null,
    ISSTUDENT tinyint(1) default 0 null,
    LINKTEXT varchar(255) null,
    LINKURL varchar(255) null,
    MAXAGE int null,
    MAXMEMBERSHIPDURATIONINDAYS int null,
    MAXMILES decimal(38) null,
    MAXPRICE decimal(38) null,
    MINAGE int null,
    MINMEMBERSHIPDURATIONINDAYS int null,
    MINMILES decimal(38) null,
    MINPRICE decimal(38) null,
    OUTDATED tinyint(1) default 0 null,
    REASON varchar(255) null,
    SEASONTICKET tinyint(1) default 0 null,
    WOELFECLUBMEMBERSHIP tinyint(1) default 0 null,
    LIMITPERUSERANDITEM int null,
    PERCENTAGE tinyint(1) default 0 not null
);

create table discountentity_clubroles
(
    DiscountEntity_ID bigint null,
    CLUBROLES varchar(255) null,
    constraint FK_DiscountEntity_CLUBROLES_DiscountEntity_ID
        foreign key (DiscountEntity_ID) references discounts (ID)
);

create table discountentity_itemtypes
(
    DiscountEntity_ID bigint null,
    ITEMTYPES int null,
    constraint FK_DiscountEntity_ITEMTYPES_DiscountEntity_ID
        foreign key (DiscountEntity_ID) references discounts (ID)
);

create table email_notification
(
    EMAIL_TEMPLATE_ID int not null
        primary key,
    FILEPATH varchar(255) null,
    SUBJECT varchar(255) null
);

create table entry_categories
(
    ID int not null
        primary key,
    CATEGORY int not null,
    NAME varchar(255) not null
);

create table entries
(
    ID int auto_increment
        primary key,
    ACTUALVALUE decimal(12,2) not null,
    COMMENT varchar(255) null,
    DATE datetime not null,
    IS_INCOME tinyint(1) default 0 null,
    NAME varchar(255) not null,
    VALUE decimal(12,2) null,
    CATEGORY_ID int not null,
    ITEM_ID int not null,
    constraint FK_ENTRIES_CATEGORY_ID
        foreign key (CATEGORY_ID) references entry_categories (ID)
);

create table notification_templates
(
    NOTIFICATION_TEMPLATE_ID int not null
        primary key,
    IMAGEPATH varchar(255) null,
    LINK varchar(255) null,
    TEMPLATE varchar(255) null
);

create table permission_states
(
    ID int auto_increment
        primary key,
    FUNDS int null,
    MERCH int null,
    PARTY int null,
    SETTINGS int null,
    STOCK int null,
    TOUR int null,
    USERMANAGEMENT int null
);

create table users
(
    ID int auto_increment
        primary key,
    BIRTHDAY date not null,
    CLUBROLE int null,
    EMAIL varchar(255) not null,
    FIRST_NAME varchar(255) not null,
    GENDER varchar(255) null,
    HASDEBITAUTH tinyint(1) default 0 null,
    HAS_SEASON_TICKET tinyint(1) default 0 null,
    ISSTUDENT tinyint(1) default 0 null,
    IS_WOELFE_CLUB_MEMBER tinyint(1) default 0 null,
    JOIN_DATE date not null,
    MILES int not null,
    MOBILE varchar(255) null,
    PASSWORD varchar(255) not null,
    SURNAME varchar(255) not null,
    TELEPHONE varchar(255) null,
    PERMISSIONS_ID int null,
    constraint FK_USERS_PERMISSIONS_ID
        foreign key (PERMISSIONS_ID) references permission_states (ID)
);

create table bank_accounts
(
    ID int auto_increment
        primary key,
    BANKNAME varchar(255) null,
    BIC varchar(255) not null,
    IBAN varchar(255) not null,
    NAME varchar(255) null,
    USER_ID int null,
    constraint FK_BANK_ACCOUNTS_USER_ID
        foreign key (USER_ID) references users (ID)
);

create table discounts_users
(
    DiscountEntity_ID bigint not null,
    users_ID int not null,
    primary key (DiscountEntity_ID, users_ID),
    constraint FK_Discounts_USERS_DiscountEntity_ID
        foreign key (DiscountEntity_ID) references discounts (ID),
    constraint FK_Discounts_USERS_users_ID
        foreign key (users_ID) references users (ID)
);

create table images
(
    ID int auto_increment
        primary key,
    FILENAME varchar(255) null,
    ENTRY_ID int null,
    ITEM_ID int null,
    USER_ID int null,
    constraint FK_IMAGES_ENTRY_ID
        foreign key (ENTRY_ID) references entries (ID),
    constraint FK_IMAGES_USER_ID
        foreign key (USER_ID) references users (ID)
);

create table notification_unsubscriptions
(
    ID int auto_increment
        primary key,
    BROADCASTERTYPE int null,
    NOTIFICATIONTYPE int null,
    USER_ID int null,
    constraint FK_NOTIFICATION_UNSUBSCRIPTIONS_USER_ID
        foreign key (USER_ID) references users (ID)
);

create index unsubscription_user
    on notification_unsubscriptions (USER_ID);

create table notifications
(
    ID int auto_increment
        primary key,
    DATA mediumtext null,
    NOTIFICATIONTYPE int null,
    STATUS int null,
    TIMESTAMP datetime not null,
    USER_ID int null,
    constraint FK_NOTIFICATIONS_USER_ID
        foreign key (USER_ID) references users (ID)
);

create table orders
(
    ID int auto_increment
        primary key,
    METHOD int null,
    TEXT varchar(255) null,
    TIMESTAMP datetime not null,
    BANKACCOUNT_ID int null,
    USER_ID int not null,
    constraint FK_ORDERS_BANKACCOUNT_ID
        foreign key (BANKACCOUNT_ID) references bank_accounts (ID),
    constraint FK_ORDERS_USER_ID
        foreign key (USER_ID) references users (ID)
);

create table shop_items
(
    ID int auto_increment
        primary key,
    CAPACITY int not null,
    DATE datetime not null,
    DESCRIPTION longtext null,
    EXPECTEDCHECKINROLE int null,
    EXPECTEDREADROLE int null,
    EXPECTEDWRITEROLE int null,
    MATERIAL varchar(255) null,
    MILES int null,
    PAYMENTLIMIT int null,
    PRICE decimal(12,2) not null,
    TITLE varchar(255) not null,
    type int not null,
    VEHICLE varchar(255) null,
    GROUPPICTURE_ID int null,
    DURATION int null,
    constraint FK_SHOP_ITEMS_GROUPPICTURE_ID
        foreign key (GROUPPICTURE_ID) references images (ID)
);

create table addresses
(
    ID int auto_increment
        primary key,
    CITY varchar(255) null,
    COUNTRY varchar(255) null,
    LATITUDE double null,
    LONGITUDE double null,
    NAME varchar(255) null,
    STREET varchar(255) null,
    STREETNR varchar(255) null,
    ZIP varchar(255) null,
    ITEM_ID int null,
    USER_ID int null,
    constraint FK_ADDRESSES_ITEM_ID
        foreign key (ITEM_ID) references shop_items (ID),
    constraint FK_ADDRESSES_USER_ID
        foreign key (USER_ID) references users (ID)
);

create table comments
(
    ID int auto_increment
        primary key,
    CONTENT varchar(255) not null,
    TIMESTAMP datetime not null,
    AUTHOR int not null,
    ITEM int not null,
    PARENT_ID int null,
    CHILDREN int null,
    constraint FK_COMMENTS_AUTHOR
        foreign key (AUTHOR) references users (ID),
    constraint FK_COMMENTS_CHILDREN
        foreign key (CHILDREN) references comments (ID),
    constraint FK_COMMENTS_ITEM
        foreign key (ITEM) references shop_items (ID),
    constraint FK_COMMENTS_PARENT_ID
        foreign key (PARENT_ID) references comments (ID)
);

create table discounts_shop_items
(
    DiscountEntity_ID bigint not null,
    items_ID int not null,
    primary key (DiscountEntity_ID, items_ID),
    constraint FK_Discounts_SHOP_ITEMS_DiscountEntity_ID
        foreign key (DiscountEntity_ID) references discounts (ID),
    constraint FK_Discounts_SHOP_ITEMS_items_ID
        foreign key (items_ID) references shop_items (ID)
);

alter table entries
    add constraint FK_ENTRIES_ITEM_ID
        foreign key (ITEM_ID) references shop_items (ID);

alter table images
    add constraint FK_IMAGES_ITEM_ID
        foreign key (ITEM_ID) references shop_items (ID);

create table ordered_items
(
    ID int auto_increment
        primary key,
    IS_DRIVER tinyint(1) default 0 null,
    NEEDS_TICKET tinyint(1) default 0 null,
    PRICE decimal(38) null,
    SIZE varchar(255) null,
    STATUS int null,
    COLOR_ID int null,
    ITEM_ID int not null,
    ORDER_ID int null,
    DESCRIPTION longtext null,
    constraint FK_ORDERED_ITEMS_COLOR_ID
        foreign key (COLOR_ID) references colors (ID),
    constraint FK_ORDERED_ITEMS_ITEM_ID
        foreign key (ITEM_ID) references shop_items (ID),
    constraint FK_ORDERED_ITEMS_ORDER_ID
        foreign key (ORDER_ID) references orders (ID)
);

create table ordereditem_discounts
(
    orderedItem_id int not null,
    discount_id bigint not null,
    primary key (orderedItem_id, discount_id),
    constraint FK_orderedItem_discounts_discount_id
        foreign key (discount_id) references discounts (ID),
    constraint FK_orderedItem_discounts_orderedItem_id
        foreign key (orderedItem_id) references ordered_items (ID)
);

create index INDEX_SHOP_ITEMS_type
    on shop_items (type);

create index item_type
    on shop_items (type);

create table shopitem_paymentmethods
(
    ShopItem_ID int null,
    PAYMENTMETHODS varchar(255) null,
    constraint FK_ShopItem_PAYMENTMETHODS_ShopItem_ID
        foreign key (ShopItem_ID) references shop_items (ID)
);

create table stock
(
    ID int auto_increment
        primary key,
    AMOUNT int null,
    SIZE varchar(255) null,
    COLOR_ID int null,
    ITEM_ID int null,
    constraint FK_STOCK_COLOR_ID
        foreign key (COLOR_ID) references colors (ID),
    constraint FK_STOCK_ITEM_ID
        foreign key (ITEM_ID) references shop_items (ID)
);

create table size_table
(
    ID int auto_increment
        primary key,
    MAX int null,
    MIN int not null,
    NAME varchar(255) not null,
    STOCK_ID int null,
    SIZETABLE_ID int null,
    constraint FK_SIZE_TABLE_SIZETABLE_ID
        foreign key (SIZETABLE_ID) references stock (ID),
    constraint FK_SIZE_TABLE_STOCK_ID
        foreign key (STOCK_ID) references stock (ID)
);

create table user_authoreditems
(
    author_id int not null,
    authoreditems_id int not null,
    primary key (author_id, authoreditems_id),
    constraint FK_user_authoreditems_author_id
        foreign key (author_id) references shop_items (ID),
    constraint FK_user_authoreditems_authoreditems_id
        foreign key (authoreditems_id) references users (ID)
);

create table user_reportresponsibilities
(
    reportwriters_id int not null,
    reportresponsibilities_id int not null,
    primary key (reportwriters_id, reportresponsibilities_id),
    constraint FK_user_reportresponsibilities_reportwriters_id
        foreign key (reportwriters_id) references shop_items (ID),
    constraint userreportresponsibilitiesreportresponsibilitiesid
        foreign key (reportresponsibilities_id) references users (ID)
);

create table waiting_list
(
    ID int auto_increment
        primary key,
    SHOPITEM_ID int not null,
    USER_ID int not null,
    SIZE varchar(255) null,
    COLOR_ID int null,
    ISDRIVER tinyint(1) default 0 null,
    NEEDSTICKET tinyint(1) default 0 null,
    constraint FK_WAITING_LIST_SHOPITEM_ID
        foreign key (SHOPITEM_ID) references shop_items (ID),
    constraint FK_WAITING_LIST_USER_ID
        foreign key (USER_ID) references users (ID)
);

