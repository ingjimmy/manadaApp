import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateColor',
})
export class DateColorPipe implements PipeTransform {
  transform(date: any, args?: any): string {
    if (date != null) {
      let momentDate = moment(new Date(date));

      let reference = moment(new Date());
      let today = reference.clone().startOf('day');
      let yesterday = reference.clone().subtract(1, 'days').startOf('day');
      let aWeek = reference.clone().add(7, 'days').startOf('day');
      let response = momentDate.format('ddd DD MMM');

      if (momentDate.isBefore(yesterday, 'd')) {
        response = momentDate.format('ddd DD MMM');
      } else if (momentDate.isSame(today, 'd')) {
        response = 'today';
      } else if (momentDate.isSame(yesterday, 'd')) {
        response = 'yesterday';
      } else if (momentDate.isBefore(aWeek, 'd')) {
        response = momentDate.format('dddd');
      }

      let color = 'green';
      if (args !== undefined) {
        if (moment(args, 'YYYY/MM/DD HH:mm:ss').diff(momentDate) < 0) {
          color = 'red';
        }
      } else {
        if (momentDate.diff(reference) < 0) {
          color = 'red';
        }
      }

      return `<span class="${color}">${response}</span>`;
    } else {
      return '';
    }

  }
}
