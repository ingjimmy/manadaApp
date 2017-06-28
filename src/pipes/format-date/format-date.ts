import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment'

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(date: string) {
     if (date != '') {
      let momentDate = moment(date, 'YYYY/MM/DD HH:mm:ss');
      return momentDate.format('ddd DD MMM YYYY h:mm:ss A');
    } else {
      return '';
    }
  }
}
