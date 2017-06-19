import { Configuration } from './../../configuration/configuration';
import { IResult } from './../../models/IResult';
import { NavParams, Platform, Content, ActionSheetController, InfiniteScroll, Footer, ModalController } from 'ionic-angular';
import { Component, ViewChild, Renderer } from '@angular/core';
import { ActionModel } from "../../models/action-model";
import { ActionService, CommentService } from "../../services/index";
import { CommentModel } from "../../models/comment-model";
import { CommentFilter } from "../../filters/comment-filter";
import { Keyboard } from '@ionic-native/keyboard';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { BrowserTab } from "@ionic-native/browser-tab";
import { CommentCrudComponent } from "../comment-crud/comment-crud";
import { CameraHelper } from "../../helpers/camera-helper";
import { AlertHelper } from "../../helpers/alert-helper";

@Component({
    templateUrl: 'action-detail.html'
})
export class ActionDetailComponent {
    @ViewChild(Content) content: Content;
    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild(Footer) footer: Footer;
    public rootPath: string;
    public model: ActionModel = new ActionModel();
    public comments: Array<CommentModel> = new Array<CommentModel>();
    public comment: CommentModel = new CommentModel();
    public commentFilter: CommentFilter = new CommentFilter();
    public totalComments: number = 0;
    public keyboardHideSub: any;
    public keyboardShowSub: any;
    constructor(
        public platform: Platform,
        public params: NavParams,
        private actionService: ActionService,
        private commentService: CommentService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        public actionSheetCtrl: ActionSheetController,
        public photoViewer: PhotoViewer,
        private browserTab: BrowserTab,
        public modalCtrl: ModalController,
        private cameraHelper: CameraHelper,
        private alertHelper: AlertHelper) {
        this.rootPath = Configuration.Url;
        this.model = params.get('action');
        this.model.files = [];
        this.commentFilter.actionID = this.model.actionID;
        this.commentFilter.page = 0;
        this.actionService.get(this.model.actionID).subscribe(data => {
            this.model = data.json();
        }, error => {
            console.log(error);
        });
        this.bindComments(() => {
            setTimeout(() => {
                this.content.scrollToBottom();
                this.infiniteScroll.enable(true);
            }, 200);
        });
    }

    public ionViewDidLoad(): void {
        if (this.platform.is('ios')) {
            this.addKeyboardListeners()
        }
    }

    public bindComments(call?: (hasNextPage: boolean) => void): void {
        this.commentService.getAll(this.commentFilter).subscribe(data => {
            let result: IResult = data.json();
            this.totalComments = result.totalCount;
            let length = this.comments.length;

            if (this.commentFilter.page == 0) {
                this.comments = [];
            }

            result.results.forEach((t, index) => {
                let comment: CommentModel = t;
                comment.index = (this.totalComments + 1) - length - index;
                this.comments.unshift(comment);
            });

            this.commentFilter.hasNextPage = result.hasNextPage;
            if (call != null) {
                call.call(null);
            }
        }, error => {
            console.log(error);
        })
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

    public files(event: Event): void {
        event.preventDefault();
        this.cameraHelper.takeFromDevice((file) => {
            this.comment.files.push(file);
        });
    }

    public send(event: Event): void {
        event.preventDefault();
        document.getElementById('commentinput').focus();
        if (this.comment.content != '') {
            this.comment.actionID = this.model.actionID;
            this.commentService.add(this.comment).subscribe(data => {
                let result = data.json();
                this.totalComments += 1;
                result.index = this.totalComments + 1;
                this.comments.push(result);
                this.comment = new CommentModel();
                let dimension = this.content.getContentDimensions();
                this.content.scrollTo(0, dimension.scrollHeight);
            }, error => {
                console.log(error);
            })
        }
    }

    public openPicture(file: any): void {
        this.photoViewer.show(this.rootPath + file.path);
    }

    public openFile(file: any): void {
        this.browserTab.openUrl(this.rootPath + file.path);
    }

    public footerTouchStart(event): void {
        if (event.target.localName !== "input" && event.target.localName !== "button") {
            event.preventDefault();
        }
    }

    public removeFile(event: Event, file: any): void {
        event.preventDefault();
        let index = this.comment.files.indexOf(file);
        this.comment.files.splice(index, 1);
    }

    public contentMouseDown(event): void {
        document.getElementById('commentinput').blur();
    }

    public doInfinite(infiniteScroll): void {
        if (this.commentFilter.hasNextPage) {
            this.commentFilter.page++;
            this.bindComments(() => {
                infiniteScroll.complete();
            });
        } else {
            infiniteScroll.enable(false);
        }
    }

    public displayMenuAction(): void {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Manada',
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Edit',
                    icon: !this.platform.is('ios') ? 'edit' : null,
                    handler: () => {
                        console.log('Edit clicked');
                    }
                },
                {
                    text: 'Delete',
                    icon: !this.platform.is('ios') ? 'list' : null,
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: !this.platform.is('ios') ? 'close' : null
                }
            ]
        });
        actionSheet.present();
    }

    public displayMenuComment(comment: CommentModel): void {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Manada',
            cssClass: 'action-sheets-basic-page',
            buttons: [
                {
                    text: 'Edit',
                    icon: !this.platform.is('ios') ? 'edit' : null,
                    handler: () => {
                        let pop = this.modalCtrl.create(CommentCrudComponent, { comment: comment, comments: this.comments });
                        pop.present();
                    }
                },
                {
                    text: 'Delete',
                    icon: !this.platform.is('ios') ? 'list' : null,
                    handler: () => {
                        this.alertHelper.confirm(
                            '¿Are you sure to delete the comment?',
                            () => {
                                this.commentService.delete(comment).subscribe(data => {
                                    let index = this.comments.indexOf(comment);
                                    this.comments.splice(index, 1);
                                }, error => {
                                    console.log(error);
                                });
                            }
                        )
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: !this.platform.is('ios') ? 'close' : null,
                }
            ]
        });
        actionSheet.present();
    }
}