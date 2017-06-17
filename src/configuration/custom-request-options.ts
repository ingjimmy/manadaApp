import { BaseRequestOptions, RequestOptionsArgs, RequestOptions } from "@angular/http";

export class CustomRequestOptions extends BaseRequestOptions {
    merge(options?: RequestOptionsArgs): RequestOptions {
    var newOptions = super.merge(options);
    newOptions.headers.set('Authorization', 'bearer ' + localStorage.getItem('accessToken'));
    return newOptions;
  }
}