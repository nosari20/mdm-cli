import { Component, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cli';

  tabs: string[] = ['Terminal 0'];
  activeTab: number = 0;
  editTab: number = -1;


  constructor(private element: ElementRef) {}

  changeTab(event, tab: number): void {
    event.stopPropagation();
    this.activeTab = tab;
    this.editTab = (this.editTab == tab ? tab : -1);
  }

  edit(event, index: number) : void {
    this.editTab = index;
    event.preventDefault();
    event.stopPropagation();
    setTimeout(function(){
      let el = event.srcElement;
      el.setSelectionRange(el.value.length, el.value.length)
      let sel = window.getSelection();
      sel.removeAllRanges();
      el.focus();
      
    }, 1)
   
  }

  trackByFn(index: any, item: any) {
    return index;
 }

 close(index: number): void {
   this.tabs.splice(index, 1);
 }

 add(): void {
   this.tabs.push('Terminal ' + this.tabs.length);
 }


 @HostListener('document:click', ["$event"]) clickOut(event){
    if(event.srcElement != this.element){
      this.editTab = -1;
    }
  }
}
