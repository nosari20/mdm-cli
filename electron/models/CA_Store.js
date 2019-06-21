const Store = require('electron-store');
const store =  new Store();
module.exports =  {

    /*
    * Data format :
    *
    * {
    *   cert : string (PEM Format)
    *   name : string
    * }
    * 
    */

 
    name : 'CA',
    data : (Object.getOwnPropertyNames(store.get(this.name)).length > 0 ? store.get(this.name) : {CA:[]}), //

    add(ca){
        this.data.CA.push(ca);
        return this.save();
    },

    remove(id){
        this.data.CA = this.data.CA.filter(d => d.id !== id);
        return this.save();
    },

    list(){
        return this.data.CA;
    },

    findById(id){
        return this.data.CA.filter(d => d.id == id);
    },

    save(){
        store.set(this.name, this.data.CA);
        return true;
    },

    empty(){
        this.data = {CA:[]};
        return this.save();
    }

}
