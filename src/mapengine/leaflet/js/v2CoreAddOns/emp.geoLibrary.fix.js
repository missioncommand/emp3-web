if (typeof (Number.prototype.toFixed) === "function") {
    Number.prototype.toPrecisionFixed = function (precision) {
        return this.toFixed(precision);
    };
} else {
    Number.prototype.toPrecisionFixed = function (precision) {
        if (isNaN(this)) return 'NaN';
        var numb = this < 0 ? -this : this; // can't take log of -ve number...
        var sign = this < 0 ? '-' : '',
            l,
            n;

        if (numb == 0) { // can't take log of zero, just format with precision zeros
            n = '0.';
            while (precision--) n += '0';
            return n;
        }

        var scale = Math.ceil(Math.log(numb) * Math.LOG10E); // no of digits before decimal
        n = String(Math.round(numb * Math.pow(10, precision - scale)));
        if (scale > 0) { // add trailing zeros & insert decimal as required
            l = scale - n.length;
            while (l-- > 0) n = n + '0';
            if (scale < n.length) n = n.slice(0, scale) + '.' + n.slice(scale);
        } else { // prefix decimal and leading zeros if required
            while (scale++ < 0) n = '0' + n;
            n = '0.' + n;
        }
        return sign + n;
    };
}
