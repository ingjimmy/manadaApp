import { Configuration } from './../../configuration/configuration';
import { IResult } from './../../models/IResult';
import { NavParams, Platform, Content, ActionSheetController, LoadingController, ToastController, InfiniteScroll, Footer, ModalController } from 'ionic-angular';
import { Component, ViewChild, Renderer } from '@angular/core';
import { ActionModel } from "../../models/action-model";
import { ActionService, CommentService } from "../../services/index";
import { CommentModel } from "../../models/comment-model";
import { CommentFilter } from "../../filters/comment-filter";
import { Keyboard } from '@ionic-native/keyboard';
import { Camera } from '@ionic-native/camera';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { BrowserTab } from "@ionic-native/browser-tab";
import { CommentCrudComponent } from "../comment-crud/comment-crud";

@Component({
    templateUrl: 'action-detail.html'
})
export class ActionDetailComponent {
    @ViewChild(Content) content: Content;
    @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
    @ViewChild(Footer) footer: Footer;
    rootPath: string;
    model: ActionModel = new ActionModel();
    comments: Array<CommentModel> = new Array<CommentModel>();
    comment: CommentModel = new CommentModel();
    commentFilter: CommentFilter = new CommentFilter();
    totalComments: number = 0;
    keyboardHideSub: any;
    keyboardShowSub: any;
    constructor(
        public platform: Platform,
        public params: NavParams,
        private actionService: ActionService,
        private commentService: CommentService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        private camera: Camera,
        public actionSheetCtrl: ActionSheetController,
        private transfer: Transfer,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public photoViewer: PhotoViewer,
        private browserTab: BrowserTab,
        public modalCtrl: ModalController) {
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

    ionViewDidLoad() {
        if (this.platform.is('ios')) {
            this.addKeyboardListeners()
        }
    }

    bindComments(call?: (hasNextPage: boolean) => void) {
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

    addKeyboardListeners() {
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

    files(event: Event) {
        event.preventDefault();
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Select Image Source',
            buttons: [
                {
                    text: 'Load from Library',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                    }
                },
                {
                    text: 'Use Camera',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.CAMERA);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
        actionSheet.present();
    }

    takePicture(sourceType) {
        let options = {
            quality: 100,
            sourceType: sourceType,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };

        this.camera.getPicture(options).then((imagePath) => {
            this.uploadImage(imagePath);
        }, (err) => {
            console.log(err)
        });
    }

    public uploadImage(pat: string) {
        // Destination URL
        var url = `${this.rootPath}/api/v2/files/upload`;
        var options = {
            fileKey: "file",
            fileName: 'file.jpg',
            chunkedMode: false,
            headers: {
                'Authorization': 'bearer ' + localStorage.getItem('accessToken')
            },
            mimeType: "multipart/form-data"
        };

        const fileTransfer: TransferObject = this.transfer.create();

        let loading = this.loadingCtrl.create({
            content: 'Uploading...',
        });
        loading.present();

        // Use the FileTransfer to upload the image
        fileTransfer.upload(pat, url, options).then(data => {
            let file = JSON.parse(data.response);
            this.comment.files.push(file);
            loading.dismissAll();
        }, error => {
            this.presentToast(error.http_status);
            loading.dismissAll();
        });
    }

    send(event: Event) {
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

    openPicture(file: any) {
        this.photoViewer.show(this.rootPath + file.path);
    }

    openFile(file: any) {
        this.browserTab.openUrl(this.rootPath + file.path);
    }

    footerTouchStart(event) {
        if (event.target.localName !== "input" && event.target.localName !== "button") {
            event.preventDefault();
        }
    }

    presentToast(text) {
        let toast = this.toastCtrl.create({
            message: text,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

    removeFile(event: Event, file: any) {
        event.preventDefault();
        let index = this.comment.files.indexOf(file);
        this.comment.files.splice(index, 1);
    }

    contentMouseDown(event) {
        //console.log('blurring input element :- > event type:', event.type);
        document.getElementById('commentinput').blur();
    }

    doInfinite(infiniteScroll) {
        if (this.commentFilter.hasNextPage) {
            this.commentFilter.page++;
            this.bindComments(() => {
                infiniteScroll.complete();
            });
        } else {
            infiniteScroll.enable(false);
        }
    }

    displayMenuAction() {
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
                    icon: !this.platform.is('ios') ? 'close' : null,
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    displayMenuComment(comment: CommentModel) {
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
                        
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: !this.platform.is('ios') ? 'close' : null,
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }
}