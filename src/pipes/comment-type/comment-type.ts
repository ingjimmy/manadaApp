import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commentType',
})
export class CommentTypePipe implements PipeTransform {
  transform(comments: Array<any>, type: number) {    
    if (type == 0) {
      return comments.filter(comment => comment.type === type);
    } else if (type == 1) {
      return comments.filter(comment => {
         let ext = comment.name.split('.').pop();
         return comment.type === 1 && ext != 'm4a' && ext != 'wav' && ext != 'mp3';
      });
    } else {
      return comments.filter(comment => {
         let ext = comment.name.split('.').pop();
         return comment.type === 1 && (ext == 'm4a' || ext == 'wav' || ext == 'mp3');
      });
    }
  }
}
