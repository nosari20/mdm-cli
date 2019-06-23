import { Injectable } from '@angular/core';
import { Command } from '../types/Command';
import { IO } from '../types/IO';
import { CheckURL } from '../programs/checkURL';
import { CheckCert } from '../programs//checkCert';
import { TCPPing } from '../programs//tcpPing'
import { HTTP } from '../programs//http'
import { Script } from '../programs//script'
import { File } from '../programs//file'
import { Clear } from '../programs//clear'
import { ProgramList } from '../types/ProgramList';

@Injectable({
  providedIn: 'root'
})
export class EngineService {

  programs : ProgramList[] = [
    {
      category : 'Standard',
      programs : [CheckURL, CheckCert, TCPPing, HTTP, File, Script, Clear]
    }
  ];

  constructor() {}

  public init(addOns: ProgramList[] = []){
    this.programs[0].programs.sort();
    this.programs = this.programs.concat(addOns)

  }

  public execute(io: IO, command : Command): void {
    if(command.command == 'help') return this.help(io);
    
    for (let pl of this.programs) {
      for (let p of pl.programs) {
        if(p.command == command.command){
          if(command.args.length > 0 && (command.args[0]=='--help' || command.args[0]=='help')) return p.help(io);
          p.main(io, command.args, command.options);
          return;
        }
      }
    }

    io.println("Command " + command.command +" not found");
    io.exit(-1, {error: 'Command not found'});  
    
  }

  public help(io: IO): void {
    for (let pl of this.programs) {
      io.println(io.EOL + pl.category + ' :' + io.EOL);
      for (let p of pl.programs) {
        io.println('    ' + p.command + ' : ' + p.descritpion + io.EOL);
      }
    }
    io.println('');
    io.exit(0);

    
  }
}
