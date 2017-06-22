import { Configuration } from './../configuration/configuration';
import { ActionSheetController, LoadingController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Camera } from '@ionic-native/camera';
import { Transfer, TransferObject } from '@ionic-native/transfer';

@Injectable()
export class CameraHelper {
    private rootPath: string;
    constructor(
        private actionSheetCtrl: ActionSheetController,
        private camera: Camera,
        private transfer: Transfer,
        private loadingCtrl: LoadingController) {
        this.rootPath = Configuration.Url;
    }

    public takeFromDevice(call: (data: any) => void) {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Select Image Source',
            buttons: [
                {
                    text: 'Load from Library',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY, call);
                    }
                },
                {
                    text: 'Use Camera',
                    handler: () => {
                        this.takePicture(this.camera.PictureSourceType.CAMERA, call);
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

    private takePicture(sourceType: any, call: (data: any) => void): void {
        let options = {
            quality: 100,
            sourceType: sourceType,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };

        this.camera.getPicture(options).then((imagePath) => {
            this.uploadImage(imagePath, call);
        }, (err) => {
            console.log(err)
        });
    }

    private uploadImage(pat: string, call: (data: any) => void): void {
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

        fileTransfer.upload(pat, url, options).then(data => {
            let file = JSON.parse(data.response);
            call.call(null, file);
            loading.dismissAll();
        }, error => {
            loading.dismissAll();
        });
    }
}