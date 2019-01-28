import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgxElectronModule} from 'ngx-electron';

import { AppComponent } from './app.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { EngineService } from './services/engine.service';
import { FrameComponent } from './components/frame/frame.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';



@NgModule({
  declarations: [
    AppComponent,
    TerminalComponent,
    FrameComponent,
    SafeHtmlPipe
  ],
  imports: [
    BrowserModule,
    NgxElectronModule
  ],
  providers: [
    EngineService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
