export function formatDate(fecha) {
    const objectDate = new Date(fecha);

    const day = objectDate.getDate();
    const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Setiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];
    const month = monthNames[objectDate.getMonth()];

    // Usar un operador ternario para agregar un "0" cuando day sea menor que 10
    const formattedDay = day < 10 ? `0${day}` : day;

    return `${formattedDay} ${month}`;
}

export function formatDateComplete(fecha) {
    const objectDate = new Date(fecha);

    const day = objectDate.getDate();
    const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Setiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];
    const month = monthNames[objectDate.getMonth()];
    const year = objectDate.getFullYear();

    // Usar un operador ternario para agregar un "0" cuando day sea menor que 10
    const formattedDay = day < 10 ? `0${day}` : day;

    return `${formattedDay} de ${month} del ${year}`;
}
