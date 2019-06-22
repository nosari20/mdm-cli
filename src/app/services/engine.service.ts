import { Injectable } from '@angular/core';
import { Command } from '../types/Command';
import { IO } from '../types/IO';
import { Program } from '../types/Program';
import { CheckURL } from '../programs/common/checkURL';
import { CheckCert } from '../programs/common/checkCert';
import { TCPPing } from '../programs/common/tcpPing'
import { HTTP } from '../programs/common/http'
import { Script } from '../programs/common/script'
import { File } from '../programs/common/file'
import { Clear } from '../programs/common/clear'

import { Core } from '../programs/MI/Core';
import { Sentry } from '../programs/MI/Sentry';

@Injectable({
  providedIn: 'root'
})
export class EngineService {

  programs : Program[] = []

  constructor() {
    this.init();
  }

  private init(){

    this.programs.push(CheckURL);
    this.programs.push(CheckCert);
    this.programs.push(TCPPing);
    this.programs.push(HTTP);
    this.programs.push(File);
    this.programs.push(Script);
    this.programs.push(Clear);
    // sort common commands
    this.programs.sort();

    this.programs.push(Core);
    this.programs.push(Sentry);




  }

  public execute(io: IO, command : Command): void {
    if(command.command == 'help') return this.help(io);
    
    for (let p of this.programs) {
      if(p.command == command.command){
        if(command.args.length > 0 && (command.args[0]=='--help' || command.args[0]=='help')) return p.help(io);
        p.main(io, command.args, command.options);
        return;
      }
    }

    io.out("Command " + command.command +" not found");
    setTimeout(function(){
      io.clear(1);
      io.exit(-1);  
    },2000)
    
  }

  public help(io: IO): void {
    io.out('Available commands :' + io.EOL);

    for (let p of this.programs) {
      io.out(p.command + ' : ' + p.descritpion + io.EOL);
    }
    io.exit(0);
  }
}
