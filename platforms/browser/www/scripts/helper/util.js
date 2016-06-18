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


        if(lat.indexOf("°") == -1 && lng.indexOf("°") == -1){
            lt = parseFloat(lat);
            lg = parseFloat(lng);
        }else{
            var hora = subStrWithParse(lat, 0, 2);
            var minutos = subStrWithParse(lat, 3, 5);
            var segundos = subStrWithParse(lat, 6, 11);

            lt = (hora + (minutos / 60) + (segundos / 3600)) * -1;

            hora = subStrWithParse(lng, 0, 2);
            minutos = subStrWithParse(lng, 3, 5);
            segundos = subStrWithParse(lng, 6, 11);

            lg = (hora + (minutos / 60) + (segundos / 3600)) * -1;
        }
        return {lat: lt, lng: lg};
    }

    function subStrWithParse(s, b, e) {
        return parseFloat(s.substring(b, e));
    }
};


