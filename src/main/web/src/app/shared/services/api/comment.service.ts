import {Injectable} from "@angular/core";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Comment} from "../../../shop/shared/model/comment";

interface CommentApiResponse {
	comments: Comment[];
}

@Injectable()
export class CommentService extends ServletService<Comment> {
	baseUrl = "/api/comment";

	constructor(private http: HttpClient) {
		super();
	}

	/**
	 *
	 * @param id
	 */
	getById(id: number): Observable<Comment> {
		const params = new HttpParams().set("id", "" + id);
		const request = this.performRequest(this.http.get<CommentApiResponse>(this.baseUrl, {params}))
			.map(response => response.comments)
			.map(json => Comment.create().setProperties(json[0]));

		return this._cache.getById(params, request);
	}

	/**
	 *
	 * @param eventId
	 * @returns {Observable<Comment[]>}
	 */
	getByEventId(eventId: number): Observable<Comment[]> {
		const params = new HttpParams().set("eventId", "" + eventId);
		const request = this.performRequest(this.http.get<CommentApiResponse>(this.baseUrl, {params}))
			.map(response => response.comments)
			.map(commentJson => commentJson.map(json => Comment.create().setProperties(json)));

		return this._cache.search(params, request);
	}

	/**
	 *
	 * @param searchTerm
	 */
	search(searchTerm: string): Observable<Comment[]> {
		const params = new HttpParams().set("searchTerm", "" + searchTerm);
		const request = this.performRequest(this.http.get<CommentApiResponse>(this.baseUrl, {params}))
			.map(response => response.comments)
			.map(comments => comments.map(json => Comment.create().setProperties(json)));

		return this._cache.search(params, request);
	}

	/**
	 *
	 * @param requestMethod
	 * @param comment
	 * @param parentId
	 * @returns {Observable<R>}
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				comment: Comment, parentId?: number): Observable<Comment> {
		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {comment, parentId}))
			.do(() => this._cache.invalidateById(comment.id))
			.flatMap(response => this.getById(response.id))
	}

	/**
	 *
	 * @param comment
	 * @param parentId
	 */
	add(comment: Comment, parentId?: number): Observable<Comment> {
		return this.addOrModify(this.http.post.bind(this.http), comment, parentId);
	}

	/**
	 *
	 * @param comment
	 * @param parentId
	 */
	modify(comment: Comment, parentId?: number): Observable<Comment> {
		return this.addOrModify(this.http.put.bind(this.http), comment, parentId);
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
			.do(() => this._cache.invalidateById(id))
	}

}
