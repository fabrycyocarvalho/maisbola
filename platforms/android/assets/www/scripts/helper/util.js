Number.prototype.formatMoney = function () {

    var tmp = this.toString();
    tmp = tmp.replace(/([0-9]{2})$/g, ",$1");
    if (tmp.length > 6)
        tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");

    return tmp;
};

Number.prototype.padLeft = function (base, chr) {
    var len = (String(base || 10).length - String(this).length) + 1;
    return len > 0 ? new Array(len).join(chr || '0') + this : this;
};

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};

function Helper (){
    this.converterCoordenadas = function (lat, lng) {
        var lt, lg;

        if(isNaN(parseFloat(lat)) === true && isNaN(parseFloat(lng)) === true){
            var hora = lat.substring(0, 2);
            var minutos = lat.substring(3, 5);
            var segundos = lat.substring(6, 11);

            lt = hora + (minutos / 60) + (segundos / 3600);

            hora = lng.substring(0, 2);
            minutos = lng.substring(3, 5);
            segundos = lng.substring(6, 11);

            lg = hora + (minutos / 60) + (segundos / 3600);
        }else{
            lt = parseFloat(lat);
            lg = parseFloat(lng);
        }

        //lt= -16.79388888888889;
        //lg =  -49.35527777777778;

        return {lat: lt, lng: lg};
    }
};


