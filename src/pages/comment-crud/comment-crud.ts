import { Platform, NavParams, ViewController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { CommentModel } from "../../models/comment-model";
import { CommentService } from "../../services/index";

@Component({
    templateUrl: 'comment-crud.html',
})
export class CommentCrudComponent {
    @ViewChild('commentcontent') commentcontent;
    model: CommentModel = new CommentModel();
    updateComment: any;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        private commentService: CommentService) {
        this.model = params.get('comment');
    }

    ionViewDidLoad() {
        this.commentcontent.nativeElement.innerHTML = this.model.content;
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    send() {
        if (this.commentcontent.nativeElement.innerHTML != '' && this.params.get('comment') != undefined) {
            this.model.content = this.commentcontent.nativeElement.innerHTML;
            this.commentService.update(this.model).subscribe(data => {
                let comments = this.params.get('comments');
                let comment = comments.find(t => t.commentID == this.model.commentID);
                let originalIndex = comments.indexOf(comment);
                let lastIndex = comments.length;
                let index = comment.index - 1;
                comments.splice(originalIndex, 1);
                comments.push(this.model);

                for (let i = originalIndex; i < lastIndex; i++) {
                    index++;
                    comments[i].index = index;
                }

                this.dismiss();
            }, error => {
                this.dismiss();
            });
        }
    }
}