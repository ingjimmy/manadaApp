import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'tillDate',
})
export class TillDatePipe implements PipeTransform {

  transform(rawDate: string) {
    let response = '';

    if (rawDate !== '') {
      let date:any = new Date(rawDate);
      let currentDate:any = new Date();
      let difference = (currentDate - date) / 1000;

      if (difference <= 5) {
        response = 'Now';
      } else if (difference <= 20) {
        response = 'Seconds ago';
      } else if (difference <= 60) {
        response = '1 minute ago';
      } else if (difference < 3600) {
        response = Math.ceil(difference / 60) + ' minutes ago';
      } else if (difference <= 5400) {
        response = '1 hour ago';
      } else if (difference < 84600) {
        response = Math.ceil(difference / 3600) + ' hours ago';
      } else if (difference < 600000) {
        response = Math.ceil(difference / 86400) + ' days ago';
      }
      else {
        response = moment(rawDate, 'YYYY/MM/DD HH:mm:ss').format("MMMM D YYYY, h:mm a");
      }
    }

    return response;
  }
}
