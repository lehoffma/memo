package shared.model;

/**
 * Created by gzae on 12/13/16.
 */
public class BankAccount {

    public Integer AccountID;
    public String FullName;
    public String IBAN;
    public String BIC;

    public BankAccount(Integer _AccountID, String _FullName, String _IBAN, String _BIC){
        this.AccountID = _AccountID;
        this.FullName = _FullName;
        this.IBAN = _IBAN;
        this.BIC = _BIC;
    }
}
