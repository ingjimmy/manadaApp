import { NavParams, ViewController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { CommentModel } from "../../models/comment-model";
import { CommentService, MainService, HelperService, ActionService } from "../../services/index";
import { AlertHelper } from "../../helpers/alert-helper";
import { Configuration } from "../../configuration/configuration";

@Component({
    templateUrl: 'comment-crud.html',
})
export class CommentCrudComponent {
    @ViewChild('commentcontent') commentcontent;
    public model: CommentModel;
    public parent: CommentModel = new CommentModel();
    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        private commentService: CommentService,
        private mainService: MainService,
        private alertHelper: AlertHelper,
        private helperService: HelperService,
        private actionService: ActionService) {
        this.model = params.get('comment');
        this.parent = params.get('parent');
    }

    public ionViewDidLoad(): void {
        if (this.model != undefined) {
            this.commentcontent.nativeElement.innerHTML = this.model.content;
        } else {
            this.model = new CommentModel();
            this.model.parentID = this.parent.commentID;
            this.model.actionID = this.parent.actionID;
        }
    }

    public dismiss(): void {
        this.viewCtrl.dismiss();
    }

    public send(): void {
        if (this.commentcontent.nativeElement.innerHTML != '') {
            this.model.content = this.commentcontent.nativeElement.innerHTML;

            if (this.params.get('comment') != undefined) {                
                this.commentService.update(this.model).subscribe(data => {
                    if (this.model.parentID == null) {
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

                        this.updateActionPosition(comment);
                    } 

                    this.dismiss();
                }, error => {
                    this.helperService.presentToastMessage(Configuration.ErrorMessage);
                    this.dismiss();
                });
            } else if (this.params.get('parent') != undefined) {
                this.commentService.add(this.model).subscribe(data => {
                    let comments = this.params.get('comments');

                    let comment = comments.find(t => t.commentID == this.parent.commentID);
                    comment.comments.unshift(data.json());
                    let originalIndex = comments.indexOf(comment);
                    let lastIndex = comments.length;
                    let index = comment.index - 1;
                    comments.splice(originalIndex, 1);
                    comments.push(comment);

                    for (let i = originalIndex; i < lastIndex; i++) {
                        index++;
                        comments[i].index = index;
                    }

                    this.updateActionPosition(comment);

                    this.dismiss();
                }, error => {
                    this.helperService.presentToastMessage(Configuration.ErrorMessage);
                    this.dismiss();
                });
            }
        } else {
            this.alertHelper.alert('The description of the comment is required');
        }
    }

    private updateActionPosition(comment: any) {
        let action = this.mainService.actions.find(t => t.actionID == comment.actionID);
        if (action != undefined) {
            this.actionService.updateLocalAction(action, true);
            let actionIndex = this.mainService.actions.indexOf(action);
            this.mainService.actions.splice(actionIndex, 1);
            this.mainService.actions.splice(0, 0, action);
        }
    }
}