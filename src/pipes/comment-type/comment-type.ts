import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commentType',
})
export class CommentTypePipe implements PipeTransform {
  transform(comments: Array<any>, type: number) {
    return comments.filter(comment => comment.type === type);
  }
}
