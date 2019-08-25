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

create table email_notification
(
    EMAIL_TEMPLATE_ID int not null
        primary key,
    FILEPATH varchar(255) null,
    SUBJECT varchar(255) null
);

create table notification_templates
(
    NOTIFICATION_TEMPLATE_ID int not null
        primary key,
    IMAGEPATH varchar(255) null,
    LINK varchar(255) null,
    TEMPLATE varchar(255) null
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

create table shopitem_paymentmethods
(
    ShopItem_ID int null,
    PAYMENTMETHODS varchar(255) null,
    constraint FK_ShopItem_PAYMENTMETHODS_ShopItem_ID
        foreign key (ShopItem_ID) references shop_items (ID)
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


alter table ordered_items ADD DESCRIPTION longtext;

alter table shop_items
    ADD `PAYMENTLIMIT` int(11) DEFAULT NULL,
    ADD `DURATION` int(11) DEFAULT NULL,
    DROP INDEX SHOP_ITEMS_TYPE,
    ADD INDEX `INDEX_SHOP_ITEMS_type` (`type`),
    ADD INDEX `item_type` (`type`);


