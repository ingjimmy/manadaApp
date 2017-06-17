import { LoginModel } from './../models/login-model';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Configuration } from "../configuration/configuration";

@Injectable()
export class AuthService {

  constructor(private http:Http) { }

  getToken(model:LoginModel): Observable<Response> {    
    model.client_id = Configuration.ClientID;
    model.client_secret = Configuration.SecretClient;

    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    let params: URLSearchParams = new URLSearchParams();
    for (var key in model) {
      params.set(key.toString(), model[key]);
    }

    return this.http.post(`${Configuration.UrlApi}/token`, params, { headers: headers });
  }
}
