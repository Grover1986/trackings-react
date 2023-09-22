const fetchOrders = async (idOrder) => {
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("x-Org-Id", "308368e0-70f1-49df-8318-109d829435ac");

        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
        };

        if (idOrder) {
            const response = await fetch(`https://api-core-shopstar.azure-api.net/sales/orders/view-group//${idOrder}`, requestOptions);
            const dataApi = await response.json();
            return dataApi
        }
    } catch (error) {
        console.log(error)
    } 
    
};

export default fetchOrders