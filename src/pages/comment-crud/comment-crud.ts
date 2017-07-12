import { Component, ViewChild, Renderer } from '@angular/core';
import { NavParams, ViewController, Content, Footer, Platform } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';

import { CommentModel } from "../../models";
import { CommentService, MainService, HelperService, ActionService } from "../../services";
import { AlertHelper } from "../../helpers/alert-helper";
import { Configuration } from "../../configuration/configuration";

@Component({
    templateUrl: 'comment-crud.html',
})
export class CommentCrudComponent {
    @ViewChild('commentcontent') commentcontent;
    @ViewChild(Content) content: Content;
    @ViewChild(Footer) footer: Footer;
    public model: CommentModel;
    public parent: CommentModel = new CommentModel();
    public keyboardHideSub: any;
    public keyboardShowSub: any;
    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        private commentService: CommentService,
        private mainService: MainService,
        private alertHelper: AlertHelper,
        private helperService: HelperService,
        private actionService: ActionService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        public platform: Platform) {
        this.model = params.get('comment');
        this.parent = params.get('parent');
    }

    public ionViewDidLoad(): void {
        if (this.platform.is('ios')) {
            this.addKeyboardListeners()

            let scrollContentElelment = this.content.getScrollElement();

            scrollContentElelment.style.cssText = scrollContentElelment.style.cssText + "transition: all " + 200 + "ms; -webkit-transition: all " +
                200 + "ms; -webkit-transition-timing-function: ease-out; transition-timing-function: ease-out;";
        }

        if (this.model != undefined) {
            this.commentcontent.nativeElement.innerHTML = this.model.content;
        } else {
            this.model = new CommentModel();
            this.model.parentID = this.parent.commentID;
            this.model.actionID = this.parent.actionID;
        }

        let div = document.querySelectorAll('[contenteditable]')[0];
        window.setTimeout(() => {
            var sel, range;            
            if (window.getSelection && document.createRange) {
                this.keyboard.show();
                range = document.createRange();
                range.selectNodeContents(div);
                range.collapse(true);
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);                
            }
        }, 750);
    }

    private addKeyboardListeners(): void {
        let scrollContentElelment = this.content.getScrollElement();
        let footerElement = this.footer.getNativeElement();

        this.keyboardHideSub = this.keyboard.onKeyboardHide().subscribe((e) => {
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', '44px');
            this.renderer.setElementStyle(footerElement, 'marginBottom', '0px');
        });

        this.keyboardShowSub = this.keyboard.onKeyboardShow().subscribe((e) => {
            let newHeight = (e['keyboardHeight']);
            let marginBottom = newHeight + 44 + 'px';
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', marginBottom);
            this.renderer.setElementStyle(footerElement, 'marginBottom', newHeight + 'px');
            setTimeout(() => {
                this.content.scrollToBottom();
            }, 200);
        });
    }

    public dismiss(): void {
        this.keyboard.close();
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

    public footerTouchStart(event): void {
        if (event.target.localName !== "input" && event.target.localName !== "button") {
            event.preventDefault();
        }
    }
}