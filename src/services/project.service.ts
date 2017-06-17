import { Configuration } from './../configuration/configuration';
import { ProjectFilter } from './../filters/project-filter';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ProjectService {

  constructor(private http: Http) { }

  getAll(filter: ProjectFilter): Observable<Response> {
    let params: URLSearchParams = new URLSearchParams();
    for (var key in filter) {
      params.set(key.toString(), filter[key]);
    }
    
    let requestOptions = new RequestOptions();
    requestOptions.params = params;

    return this.http.get(`${Configuration.UrlApi}/projects`, requestOptions);
  }

  add(model: any): Observable<Response> {
    return this.http.post(`${Configuration.UrlApi}/projects`, model);
  }

  get(id: number): Observable<Response> {
    return this.http.get(`${Configuration.UrlApi}/projects/${id}`);
  }

  update(model: any): Observable<Response> {
    return this.http.put(`${Configuration.UrlApi}/projects/${model.projectID}`, model);
  }

  delete(id: number): Observable<Response> {
    return this.http.delete(`${Configuration.UrlApi}/projects/${id}`);
  }
}
