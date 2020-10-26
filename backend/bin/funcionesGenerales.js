const funcionesGenerales = {};
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');


funcionesGenerales.eliminarDuplicados = (dato) => {
    let sinRepetidosx = dato.filter((valorActual, indiceActual, arreglo) => {
        return arreglo.findIndex(
            valorDelArreglo => JSON.stringify(valorDelArreglo) === JSON.stringify(valorActual)
        ) === indiceActual
    });
    return sinRepetidosx;
}

funcionesGenerales.ordenarFechaAscendente = (array, propiedad) => {
    return array.sort((a, b) => new Date(a[propiedad]).getTime() - new Date(b[propiedad]).getTime());
}

funcionesGenerales.eliminarDuplicadosPorAtri = (dato, attr) => {
    let sinRepetidosx = dato.filter((valorActual, indiceActual, arreglo) => {
        return arreglo.findIndex(valorDelArreglo => JSON.stringify(valorDelArreglo[attr]) === JSON.stringify(valorActual[attr])) == indiceActual
    });
    return sinRepetidosx;
}

funcionesGenerales.ordenarAcendente = (array, propiedad) => {
    array.sort((a, b) => {
        if (
            a[propiedad] > b[propiedad]) {
            return 1;
        }
        if (a[propiedad] < b[propiedad]) {
            return -1;
        }
        return 0;
    });

    return array;
}

funcionesGenerales.formatearFecha = (date) => {
    const f = new Date(date);

    let dia = '' + f.getDate();
    let mes = '' + (f.getMonth() + 1);
    let min = '' + f.getMinutes();
    let h = '' + f.getHours();
    if (dia.length == 1) {
        dia = '0' + dia;
    }
    if (mes.length == 1) {
        mes = '0' + mes;
    }
    if (min.length == 1) {
        min = '0' + min;
    }
    if (h.length == 1) {
        h = '0' + h;
    }
    return dia + '-' + mes + '-' + f.getFullYear() + '  ' + h + ':' + min;
}

funcionesGenerales.formatearFechaCorta = (date) => {
    const f = new Date(date);
    let dia = '' + f.getDate();
    let mes = '' + (f.getMonth() + 1);
    let min = '' + f.getMinutes();
    let h = '' + f.getHours();
    if (dia.length == 1) { dia = '0' + dia; }
    if (mes.length == 1) { mes = '0' + mes; }
    if (min.length == 1) { min = '0' + min; }
    if (h.length == 1) { h = '0' + h; }
    return dia + '-' + mes + '-' + f.getFullYear();
}


funcionesGenerales.ordenarFecha = (array, propiedad) => {
    return array.sort((a, b) => {
        if (new Date(a[propiedad].replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')) < new Date(b[propiedad].replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')))
            return 1;
        if (new Date(a[propiedad].replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')) > new Date(b[propiedad].replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3')))
            return -1;
        return 0;
    });
}

funcionesGenerales.formatearFechaDescriptiva = (date) => {
    let dateMomentObject = moment(date, "DD/MM/YYYY");
    const f = dateMomentObject.toDate();
    let dia = '' + f.getDate();
    let mes = (f.getMonth() + 1);
    return dia + " de " + obtenerNombreMes(mes) + " del " + f.getFullYear()
}


function obtenerNombreMes(mes) {
    if (mes === 1) return "Enero";
    if (mes === 2) return "Febrero";
    if (mes === 3) return "Marzo";
    if (mes === 4) return "Abril";
    if (mes === 5) return "Mayo";
    if (mes === 6) return "Junio";
    if (mes === 7) return "Julio";
    if (mes === 8) return "Agosto";
    if (mes === 9) return "Septiempre";
    if (mes === 10) return "Octubre";
    if (mes === 11) return "Noviembre";
    if (mes === 12) return "Diciembre";
}


funcionesGenerales.generarTextoAleatorio = () => {
    return new Promise(async (resolve, reject) => {
        let textoRandom = Math.random() * (9999999999 - 999999999) + 999999999;
        bcrypt.hash(textoRandom + "", 10, function (err, hash) {
            if (err) {
                resolve({ status: false, message: 'encryption error', data: null })
            } else {

            } resolve({ status: true, message: 'Exito.', data: hash })
        });
    });
}

funcionesGenerales.obtenerImagenEmail = (tipo) => {
    if (tipo === 1) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ4-JKLk8YvnVSCOPz2VcoUWx84F2eOzBsjvw&usqp=CAU'
    if (tipo === 2) return 'https://www.prodezk.com/wp-content/uploads/2017/11/Icono-Cambios-en-la-empresa.png'
    if (tipo === 3) return 'https://cdn.pixabay.com/photo/2015/12/16/17/41/bell-1096280_960_720.png'
    if (tipo === 4) return 'https://image.flaticon.com/icons/png/512/2058/2058132.png'
}


module.exports = funcionesGenerales;