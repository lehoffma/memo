import {ExpandableTableColumn} from "../../../shared/expandable-table/expandable-table-column";
import {User} from "../../../shared/model/user";
import {ClubRoleTableCellComponent} from "./member-list-table-cells/clubrole-table-cell.component";
import {DateTableCellComponent} from "./member-list-table-cells/date-table-cell.component";
import {BooleanCheckMarkCellComponent} from "./member-list-table-cells/boolean-checkmark-cell.component";
import {GenderCellComponent} from "./member-list-table-cells/gender-cell.component";
import {AddressTableCellComponent} from "./member-list-table-cells/address-table-cell.component";

export const memberListColumns = {
	"firstName": new ExpandableTableColumn<User>("Vorname", "firstName"),
	"surname": new ExpandableTableColumn<User>("Nachname", "surname"),
	"clubRole": new ExpandableTableColumn<User>("Rolle", "clubRole", ClubRoleTableCellComponent),
	"birthDate": new ExpandableTableColumn<User>("Geburtstag", "birthDate", DateTableCellComponent),
	"telephone": new ExpandableTableColumn<User>("Telefon", "telephone"),
	"hasSeasonTicket": new ExpandableTableColumn<User>("Dauerkarte", "hasSeasonTicket", BooleanCheckMarkCellComponent),
	"isWoelfeClubMember": new ExpandableTableColumn<User>("Wölfecard", "isWoelfeClubMember", BooleanCheckMarkCellComponent),
	"gender": new ExpandableTableColumn<User>("Geschlecht", "gender", GenderCellComponent),
	"joinDate": new ExpandableTableColumn<User>("Eintrittsjahr", "joinDate", DateTableCellComponent),
	"address": new ExpandableTableColumn<User>("Addresse", "addresses", AddressTableCellComponent)
};
