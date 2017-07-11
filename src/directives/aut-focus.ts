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
        //const element = this.elementRef.nativeElement;
        
        setTimeout(() => {
            document.getElementsByTagName('input')[0].focus();
            //this.renderer.invokeElementMethod(element, 'focus', []);
        }, 500);
    }
}