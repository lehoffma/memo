import {Injectable} from "@angular/core";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Comment, createComment} from "../../../shop/shared/model/comment";
import {Observable} from "rxjs";
import {mergeMap, tap} from "rxjs/operators";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Page} from "../../model/api/page";
import {setProperties} from "../../model/util/base-object";

interface CommentApiResponse {
	comments: Comment[];
}

@Injectable()
export class CommentService extends ServletService<Comment> {
	constructor(protected http: HttpClient) {
		super(http, "/api/comment");
	}


	jsonToObject(json: any): Comment {
		return setProperties(createComment(), json);
	}

	/**
	 *
	 * @param eventId
	 * @param pageRequest
	 * @returns {Observable<Comment[]>}
	 */
	getByEventId(eventId: number, pageRequest: PageRequest): Observable<Page<Comment>> {
		return this.get(
			Filter.by({"eventId": "" + eventId}),
			pageRequest,
			Sort.none()
		)
	}

	/**
	 *
	 * @param requestMethod
	 * @param comment
	 * @param parentId
	 * @returns {Observable<R>}
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				comment: Comment): Observable<Comment> {

		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {comment}))
			.pipe(
				tap(() => this._cache.invalidateById(comment.id)),
				mergeMap(response => this.getById(response.id))
			);
	}


	/**
	 *
	 * @param id
	 * @param parentId
	 */
	remove(id: number, parentId?: number): Observable<Object> {
		return this.performRequest(this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id).set("parentId", "" + parentId)
		}))
			.pipe(
				tap(() => this._cache.invalidateById(id))
			);
	}

}
