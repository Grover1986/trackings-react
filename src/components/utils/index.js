export function formatDate(fecha) {
    const objectDate = new Date(fecha);

    const day = objectDate.getDate();
    const month = objectDate.getMonth() + 1; // Los meses van de 0 a 11, por lo que sumamos 1
    const year = objectDate.getFullYear();

    return `${day}/${month}/${year}`;
}