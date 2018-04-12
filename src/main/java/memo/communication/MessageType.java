package memo.communication;

public enum MessageType {
    REGISTRATION("Registration", "Registrierung erfolgreich!"),
    FORGOT_PASSWORD("ForgotPassword", "Passwort vergessen?"),
    CLUBROLE_CHANGE_REQUEST("StatusChangeRequest", "Jemand hat eine Statusänderung beantragt!"),

    ORDER_CONFIRMATION("OrderConfirmation", "Bestellbestätigung"),
    DEBIT_CUSTOMER("DebitCustomer", "Wichtige Informationen zu deiner Bestellung."),
    DEBIT_TREASURER("DebitTreasurer", "Leite ein Lastschrift-Verfahren für die eingegangene Bestellung ein!"),
    TRANSFER_CUSTOMER("TransferCustomer", "Wichtige Informationen zu deiner Bestellung."),
    TRANSFER_TREASURER("TransferTreasurer", "Überprüfe die eingegangene Bestellung!"),

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
