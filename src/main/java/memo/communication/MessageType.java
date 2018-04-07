package memo.communication;

public enum MessageType {
    //todo
    REGISTRATION("Registration", ""),
    FORGOT_PASSWORD("ForgotPassword", ""),
    ORDER_CONFIRMATION("OrderConfirmation", ""),
    //todo remove?
    CLUBROLE_CHANGE_REQUEST("ClubroleChangeRequest", ""),
    RESPONSIBLE_USER("ResponsibleUser", ""),
    OBJECT_HAS_CHANGED("ObjectHasChanged", "");

    private String subject;
    private String name;

    MessageType(String name, String subject) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    public String getSubject() {
        return subject;
    }
}
