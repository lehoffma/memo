package memo.communication;

public enum MessageType {
    //todo
    REGISTRATION("Registration", "Registrierung erfolgreich!"),
    FORGOT_PASSWORD("ForgotPassword", "Passwort vergessen?"),
    ORDER_CONFIRMATION("OrderConfirmation", "Bestellbestätigung"),
    //todo remove?
    CLUBROLE_CHANGE_REQUEST("ClubroleChangeRequest", "?"),
    RESPONSIBLE_USER("ResponsibleUser", "Du wurdest als Verantwortlicher hinzugefügt!"),
    OBJECT_HAS_CHANGED("ObjectHasChanged", "Ein Event an dem du teilnimmst wurde geändert!");

    private String subject = "";
    private String name = "";

    MessageType(String name, String subject) {
        this.name = name;
        this.subject = subject;
    }

    public String getName() {
        return this.name;
    }

    public String getSubject() {
        return subject;
    }
}
