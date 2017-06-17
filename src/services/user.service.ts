import { Configuration } from './../configuration/configuration';
import { UserFilter } from './../filters/user-filter';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { SettingModel } from "../models/settings-model";

@Injectable()
export class UserService {

  constructor(private http: Http) { }

  getAll(filter: UserFilter): Observable<Response> {
    let params: URLSearchParams = new URLSearchParams();
    for (var key in filter) {
      params.set(key.toString(), filter[key]);
    }
    
    let requestOptions = new RequestOptions();
    requestOptions.params = params;
    return this.http.get(`${Configuration.UrlApi}/users`, requestOptions);
  }

  add(model: any): Observable<Response> {
    return this.http.post(`${Configuration.UrlApi}/users`, model);
  }

  get(id: number): Observable<Response> {
    return this.http.get(`${Configuration.UrlApi}/users/${id}`);
  }

  update(model: any): Observable<Response> {
    return this.http.put(`${Configuration.UrlApi}/users/${model.userID}`, model);
  }

  delete(id: number): Observable<Response> {
    return this.http.delete(`${Configuration.UrlApi}/users/${id}`);
  }

  forgotten(model) {
      return this.http.post(`${Configuration.UrlApi}/users/passwordrecovery`, model);
  }

  updateSetting(id:number, setting:SettingModel) {
    return this.http.put(`${Configuration.UrlApi}/users/${id}/Setting/${setting.userSettingID}`, setting);
  }
}
