import {Injectable} from "@angular/core";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {Observable} from "rxjs/Observable";
import {Comment} from "../../shop/shared/model/comment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CacheStore} from "../stores/cache.store";

interface CommentApiResponse {
	comments: Comment[];
}

@Injectable()
export class CommentService extends ServletService<Comment> {
	baseUrl = "/api/comment";

	constructor(private http: HttpClient,
				private cache: CacheStore) {
		super();
	}

	/**
	 *
	 * @param id
	 */
	getById(id: number): Observable<Comment> {
		if (this.cache.isCached("comments", id)) {
			console.log(`commentId ${id} is cached`);
			return this.cache.cache.comments
				.map(comments => comments.find(cachedComment => cachedComment.id === id))
		}
		console.log(`commentId ${id} is not cached, retrieving from db`);

		return this.performRequest(this.http.get<CommentApiResponse>(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		}))
			.map(response => response.comments)
			.map(json => Comment.create().setProperties(json[0]))
			.do(comment => this.cache.addOrModify(comment))
	}

	/**
	 *
	 * @param eventId
	 * @returns {Observable<Comment[]>}
	 */
	getByEventId(eventId: number): Observable<Comment[]> {
		return this.performRequest(this.http.get<CommentApiResponse>(this.baseUrl, {
			params: new HttpParams().set("eventId", "" + eventId)
		}))
			.map(response => response.comments)
			.map(commentJson => commentJson.map(json => Comment.create().setProperties(json)))
			.do(comments => this.cache.addMultiple(...comments))
	}

	/**
	 *
	 * @param searchTerm
	 */
	search(searchTerm: string): Observable<Comment[]> {
		return this.performRequest(this.http.get<CommentApiResponse>(this.baseUrl, {
			params: new HttpParams().set("searchTerm", searchTerm)
		}))
			.map(response => response.comments)
			.map(comments => comments.map(json => Comment.create().setProperties(json)))
			.do(comments => this.cache.addMultiple(...comments))
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
			.do(response => this.cache.remove("comments", id))
	}

}
