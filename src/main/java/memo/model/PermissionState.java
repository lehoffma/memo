package memo.model;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.io.Serializable;
import java.lang.Integer;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: PermissionState
 *
 */
@Entity
@Table(name = "PERMISSION_STATES")

public class PermissionState implements Serializable {


	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private Permission funds;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private Permission party;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private Permission user;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private Permission merch;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private Permission tour;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private Permission stock;

	@Expose
	@Enumerated(EnumType.ORDINAL)
	private Permission account;

	private static final long serialVersionUID = 1L;

	public PermissionState() {
		super();
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Permission getFunds() {
		return funds;
	}

	public void setFunds(Permission funds) {
		this.funds = funds;
	}

	public Permission getParty() {
		return party;
	}

	public void setParty(Permission party) {
		this.party = party;
	}

	public Permission getUser() {
		return user;
	}

	public void setUser(Permission user) {
		this.user = user;
	}

	public Permission getMerch() {
		return merch;
	}

	public void setMerch(Permission merch) {
		this.merch = merch;
	}

	public Permission getTour() {
		return tour;
	}

	public void setTour(Permission tour) {
		this.tour = tour;
	}

	public Permission getStock() {
		return stock;
	}

	public void setStock(Permission stock) {
		this.stock = stock;
	}

	public Permission getAccount() {
		return account;
	}

	public void setAccount(Permission account) {
		this.account = account;
	}

	@Override
	public String toString() {
		return "PermissionState{" +
				"id=" + id +
				", funds=" + funds +
				", party=" + party +
				", user=" + user +
				", merch=" + merch +
				", tour=" + tour +
				", stock=" + stock +
				", account=" + account +
				'}';
	}
}
