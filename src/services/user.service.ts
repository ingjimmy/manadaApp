import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';

import { Configuration } from './../configuration/configuration';
import { UserFilter } from './../filters/user-filter';
import { SettingModel } from "../models";

@Injectable()
export class UserService {

  constructor(private http: Http) { }

  public getAll(filter: UserFilter): Observable<Response> {
    let params: URLSearchParams = new URLSearchParams();
    for (var key in filter) {
      params.set(key.toString(), filter[key]);
    }
    
    let requestOptions = new RequestOptions();
    requestOptions.params = params;
    return this.http.get(`${Configuration.UrlApi}/users`, requestOptions);
  }

  public add(model: any): Observable<Response> {
    return this.http.post(`${Configuration.UrlApi}/users`, model);
  }

  public get(id: number): Observable<Response> {
    return this.http.get(`${Configuration.UrlApi}/users/${id}`);
  }

  public update(model: any): Observable<Response> {
    return this.http.put(`${Configuration.UrlApi}/users/${model.userID}`, model);
  }

  public delete(id: number): Observable<Response> {
    return this.http.delete(`${Configuration.UrlApi}/users/${id}`);
  }

  public forgotten(model) {
      return this.http.post(`${Configuration.UrlApi}/users/passwordrecovery`, model);
  }

  public updateSetting(id:number, setting:SettingModel) {
    return this.http.put(`${Configuration.UrlApi}/users/${id}/Setting/${setting.userSettingID}`, setting);
  } 
}
