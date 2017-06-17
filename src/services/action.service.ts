import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Configuration } from "../configuration/configuration";
import { ActionFilter } from "../filters/action-filter";

@Injectable()
export class ActionService {

  constructor(private http: Http) { }

  getAll(filter: ActionFilter): Observable<Response> {
    let params: URLSearchParams = new URLSearchParams();
    for (var key in filter) {
      params.set(key.toString(), filter[key]);
    }

    let requestOptions = new RequestOptions();
    requestOptions.params = params;

    return this.http.get(`${Configuration.UrlApi}/actions`, requestOptions);
  }

  add(model: any): Observable<Response> {
    return this.http.post(`${Configuration.UrlApi}/actions`, model);
  }

  get(id: number): Observable<Response> {
    return this.http.get(`${Configuration.UrlApi}/actions/${id}`);
  }

  update(model: any): Observable<Response> {
    return this.http.put(`${Configuration.UrlApi}/actions/${model.userID}`, model);
  }

  delete(id: number): Observable<Response> {
    return this.http.delete(`${Configuration.UrlApi}/actions/${id}`);
  }

  patch(model: any): Observable<Response> {
    return this.http.patch(`${Configuration.UrlApi}/actions/${model.actionID}/relationusers`, model);
  }

  changeStatus(model: any): Observable<Response> {
    return this.http.patch(`${Configuration.UrlApi}/actions/${model.actionID}`, model);
  }

  countActive() {
    return this.http.get(`${Configuration.UrlApi}/actions/countactive`);
  }
}
