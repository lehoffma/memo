package memo.communication.model;

public enum NotificationType {
    //email only
    REGISTRATION,
    FORGOT_PASSWORD,
    ORDER_CONFIRMATION,

    DEBIT_CUSTOMER,
    TRANSFER_CUSTOMER,

    //notification only
    ////nothing yet

    //both
    CLUBROLE_CHANGE_REQUEST,
    RESPONSIBLE_USER,
    OBJECT_HAS_CHANGED,

    DEBIT_TREASURER,
    TRANSFER_TREASURER,
}
