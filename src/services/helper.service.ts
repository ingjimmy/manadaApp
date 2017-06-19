import { Injectable } from '@angular/core';

@Injectable()
export class HelperService {

  constructor() { }

  removeFromArray(array: Array<any>, item: any) {
    let index = array.indexOf(item);
    array.splice(index, 1);
  }
}
