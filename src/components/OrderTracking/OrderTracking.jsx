import './OrderTracking.css'
import { formatDate, formatDateComplete } from '../utils'
import { useState } from 'react'


export function OrderTracking(props) {

    const order = props.order
    const saleOrderItems = order.saleOrderItems
    let filtered = []
    let isCancelled = false
    const [orderDate, setOrderDate] = useState(order.orderDate);
    const [sellerName, setSellerName] = useState(order.sellerName);
    const [shippingOrderDate, setShippingOrderDate] = useState(order.shippingOrderDate);

    function filterAndRemoveDuplicates(trackings, isPickup, isDelivery) {
        isCancelled = false

        const filteredTrackings = trackings.filter((tracking, index, self) => {
            if (!isPickup && tracking.trackingTypeName === 'ReadyToPickUp') return false;
            if (isPickup && tracking.trackingTypeName === 'InTransit') return false;
            if (isDelivery && tracking.trackingTypeName === 'InProgress') return false;

            // Filtrar los elementos con title diferente de "Envío correo"
            if (tracking.title !== "Envío correo" && tracking.title !== "En preparación" && tracking.title !== "Pedido rechazado" && tracking.title !== "Pedido invalido") {
                // Verificar si el elemento actual es el primer duplicado de title
                const firstIndex = self.findIndex((t) => t.title === tracking.title);
                let isFiltered = index === firstIndex;
                if (isFiltered && tracking.trackingTypeName === 'Cancelled') isCancelled = true
                return isFiltered;
            }
            return false;
        });

        filteredTrackings.sort((a, b) => {
            if (a.title === 'Pedido cancelado') return 1;
            if (b.title === 'Pedido cancelado') return -1;
            return 0;
        });

        const mapStates = {
            9: { title: 'Pedido Registrado', icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Registrado-icon.svg', alt: 'icon registrado' },
            1: { title: 'Pedido Confirmado', icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Confirmado-icon.svg', alt: 'icon confirmado' },
            5: { title: 'Pedido Entregado', icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Entregado-icon.svg', alt: 'icon entregado' },
            3: { title: 'Pedido Listo para Recoger', icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Listo-para-Recoger-icon.svg', alt: 'icon listo para recoger' },
            4: { title: "Pedido Cancelado", icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Cancelado-icon.svg', alt: 'icon cancelado' },
            2: {
                title: (type) => type ? 'Pedido en Camino' : 'Pedido Listo para Recoger',
                icon: (type) => type ? 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-en-Camino-icon.svg' : 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Listo-para-Recoger-icon.svg',
                alt: (type) => type ? 'icon en camino' : 'icon listo para recoger'
            }
        }

        
        console.log('filteredTrackings', filteredTrackings)
        return {filteredTrackings: filteredTrackings.map((tracking) => {
            let mapStatus = mapStates[tracking.trackingType]
             if(mapStatus == undefined) {
               mapStatus = { title: '', icon: '', alt: `${tracking.trackingType} tengo q mapear este dato` }
             }
            return ({
            ...tracking,
            title: typeof mapStatus.title === "string" ? mapStatus.title : mapStatus.title(isDelivery),
            icon: typeof mapStatus.icon === "string" ? mapStatus.icon : mapStatus.icon(isDelivery),
            alt: typeof mapStatus.alt === "string" ? mapStatus.alt : mapStatus.alt(isDelivery)
            })
          
          })
        }
    }
    
    const deliveryChannel = {
        delivery: { title: 'Envío a domicilio', icon: 'https://mercury.vteximg.com.br/arquivos/SVG_SET_Icon-Delivey-details.svg', alt: 'icon delivery' },
        pickup: { title: 'Retiro en tienda', icon: 'https://mercury.vteximg.com.br/arquivos/SVG_SET_Icon-Pickup-details.svg', alt: 'icon pickup' }
    }
    const shippingOrderType = order.shippingOrderType === 'Regular' ? deliveryChannel.delivery : deliveryChannel.pickup
    
    let dataFilter = filterAndRemoveDuplicates(order.trackings, order.shippingOrderType === 'PickupInPoint', order.shippingOrderType === 'Regular')
    dataFilter = {
        ...dataFilter,
        orderReferenceNumber: order.orderReferenceNumber
    }
    console.log('TRACKING FILTRADA: ', dataFilter)
    filtered = dataFilter;

    const trackingItemsTpl = filtered.filteredTrackings.map((step, index) =>
        <li key={index} className={`flujoPedidosProfile_progressbar_bullet ${!isCancelled ? '' : 'red'} ${step.completed ? 'active' : ''}`} >
            <img className='flujoPedidosProfile_progressbar_iconChannel' width={44} height={44} src={step.icon} alt={step.alt} />
            <span className='flujoPedidosProfile_progressbar_text'>{step.title}</span>
            {step.completed && !isCancelled ? <span className='flujoPedidosProfile_progressbar_dateState'>{formatDate(step.createdOn)}</span> : isCancelled && <span className='flujoPedidosProfile_progressbar_dateState'>{''}</span>}
        </li>
    );

    const lastActiveTracking = filtered.filteredTrackings.filter((step) => step.completed);

    let lastActiveStatusMessage = '';

    if (lastActiveTracking) {
        if (lastActiveTracking.find(item => item.title === 'Pedido Registrado')) lastActiveStatusMessage = 'Registrado'
        if (lastActiveTracking.find(item => item.title === 'Pedido Confirmado')) lastActiveStatusMessage = 'Confirmado'
        if (lastActiveTracking.find(item => item.title === 'Pedido en Camino')) lastActiveStatusMessage = 'En camino'
        if (lastActiveTracking.find(item => item.title === 'Pedido Entregado')) lastActiveStatusMessage = 'Entregado'
        if (lastActiveTracking.find(item => item.title === 'Pedido Cancelado')) lastActiveStatusMessage = 'Cancelado'
    }

    console.log('Último estado activo:', lastActiveStatusMessage);
    console.log(saleOrderItems, typeof saleOrderItems);


    return (
        saleOrderItems.map(item => (
            <div className='flujoPedidosProfile_progressbar_content'>
            <div className='flujoPedidosProfile_progressbar_contentDetails'>
                <h2 className='flujoPedidosProfile_progressbar_idPedido'>N° de pedido:
                    <span className='flujoPedidosProfile_progressbar_textGruesita'>{filtered.orderReferenceNumber}</span>
                </h2>
                <h2 className='flujoPedidosProfile_progressbar_orderDate'>Fecha Realizada:
                    <span className='flujoPedidosProfile_progressbar_textGruesita'>{formatDateComplete(orderDate)}</span>
                </h2>
                <div className='flujoPedidosProfile_progressbar_orderDetails'>
                    <div className='flujoPedidosProfile_progressbar_imageProductContent'>
                        <img className='flujoPedidosProfile_progressbar_imageProduct' src={item.productImage} alt="imagen producto" />
                    </div>
                    <div className='flujoPedidosProfile_progressbar_Info'>
                        <div className='flujoPedidosProfile_progressbar_infoProduct'>
                            <h3 className='flujoPedidosProfile_progressbar_productName'>{item.productName}</h3>
                            <span className='flujoPedidosProfile_progressbar_sellerName'>Vendido por {sellerName}</span>
                            <span className='flujoPedidosProfile_progressbar_quantity'>Cantidad:
                                <span className='flujoPedidosProfile_progressbar_quantityNumber'>{item.quantityToBeDelivered}</span>
                            </span>
                        </div>
                        {lastActiveTracking && (
                            <span className={`flujoPedidosProfile_progressbar_lastStatusActive ${isCancelled ? 'lastStatusActiveRed' : ''}`}>{lastActiveStatusMessage}</span>
                        )}
                        <div className='flujoPedidosProfile_progressbar_contentDeliveryDate'>
                            Fecha de entrega: <p className={`flujoPedidosProfile_progressbar_deliveryDate ${isCancelled ? 'deliveryDateRed' : ''}`}>{formatDateComplete(shippingOrderDate)}</p>
                        </div>
                        <div className='flujoPedidosProfile_progressbar_deliveryChannel'>
                            <img className='flujoPedidosProfile_progressbar_deliveryChannelIcon' src={shippingOrderType.icon} alt={shippingOrderType.alt} />
                            <span className='flujoPedidosProfile_progressbar_deliveryChannelText'>{shippingOrderType.title}</span>
                        </div>
                    </div>
                </div>
            </div>
            <span className='flujoPedidosProfile_progressbar_line'></span>
            <div className='flujoPedidosProfile_progressbar_contentTracking'>
                <ul className='flujoPedidosProfile_progressbar'>
                    {trackingItemsTpl}
                </ul>
            </div>
        </div>       
        )
    )
        
    )
}