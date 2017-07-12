import { Directive, Renderer, ElementRef } from '@angular/core';

@Directive({
    selector: '[focuser]'
})
export class Focuser {
    constructor(
        private renderer: Renderer,
        private elementRef: ElementRef) {
    }
    ngAfterViewInit() {
        setTimeout(() => {
            let foc = document.getElementsByTagName('input')[0];
            if (foc != undefined) {
                foc.focus();
            }
        }, 500);
    }
}