import './Trackings.css'
import { formatDate } from '../utils'
import { Loader } from '../Loader/Loader'
import { Message } from '../Message'
import { useState, useEffect } from 'react'

function Trackings() {

    const [idOrder, setIdOrder] = useState('')
    const [data, setData] = useState({ filteredTrackings: [] })
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isCancelled, setIsCancelled] = useState(false)

    // esta función cambia de valor el value del Input
    const handleSearchChange = (event) => {
        // setValue(event.currentTarget.value.trim())
        const trimmedValue = event.currentTarget.value.trim(); // Eliminar espacios en blanco extremos
        setValue(trimmedValue);
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (value.trim() === '') {
            console.log('NO hay datos')
            setError('El campo no puede estar vacío')
        } else {
            console.log('Valor del Input:', value)
            setIdOrder(value)
            setError(null)
            setValue('')
        }
    }

    // esta función cambia de valor de idOrder
    const handleSubmitChange = () => {
        // setIdOrder(value.trim())
        const trimmedValue = value.trim(); // Eliminar espacios en blanco extremos
        setIdOrder(trimmedValue);
    }

    function filterAndRemoveDuplicates(trackings, isPickup, isDelivery) {
        setIsCancelled(false)
        const filteredTrackings = trackings.filter((tracking, index, self) => {
            if (!isPickup && tracking.trackingTypeName === 'ReadyToPickUp') return false;
            if (isPickup && tracking.trackingTypeName === 'InTransit') return false;
            if (isDelivery && tracking.trackingTypeName === 'InProgress') return false;

            // Filtrar los elementos con title diferente de "Envío correo"
            if (tracking.title !== "Envío correo" && tracking.title !== "En preparación" && tracking.title !== "Pedido rechazado") {
                // Verificar si el elemento actual es el primer duplicado de title
                const firstIndex = self.findIndex((t) => t.title === tracking.title);
                let isFiltered = index === firstIndex;
                if (isFiltered && tracking.trackingTypeName === 'Cancelled') setIsCancelled(true)
                return isFiltered;
            }
            return false;
        });

        filteredTrackings.sort((a, b) => {
            // Si el título de 'a' es 'Pedido cancelado', colócalo al final.
            if (a.title === 'Pedido cancelado') return 1;
            // Si el título de 'b' es 'Pedido cancelado', colócalo al principio.
            if (b.title === 'Pedido cancelado') return -1;
            // En otros casos, mantén el orden original.
            return 0;
        });

        const map = {
            9: {title:'Pedido Registrado', icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Registrado-icon.svg', alt: 'icon registrado'},
            1: {title: 'Pedido Confirmado', icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Confirmado-icon.svg', alt: 'icon confirmado'},
            5: {title:'Pedido Entregado', icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Entregado-icon.svg', alt: 'icon entregado'},
            3: {title: 'Pedido Listo para Recoger', icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Listo-para-Recoger-icon.svg', alt: 'icon listo para recoger'},
            4: {title: "Pedido Cancelado", icon: 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Cancelado-icon.svg', alt: 'icon cancelado'},
            2: {
                title: (type) =>  type ? 'Pedido en Camino' : 'Pedido Listo para Recoger',
                icon: (type) => type ? 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-en-Camino-icon.svg' : 'https://mercury.myvtex.com/arquivos/SVG_SET_Pedido-Listo-para-Recoger-icon.svg',
                alt: (type) => type ? 'icon en camino' : 'icon listo para recoger'
            }
        }
        console.log('filteredTrackings', filteredTrackings)
        return {
            filteredTrackings: filteredTrackings.map((tracking) => ({
                ...tracking,
                title: typeof map[tracking.trackingType].title === "string" ? map[tracking.trackingType].title : map[tracking.trackingType].title(isDelivery),
                icon: typeof map[tracking.trackingType].icon === "string" ? map[tracking.trackingType].icon : map[tracking.trackingType].icon(isDelivery),
                alt: typeof map[tracking.trackingType].alt === "string" ? map[tracking.trackingType].alt : map[tracking.trackingType].alt(isDelivery)
            }))
        }
    }

    useEffect(() => {
        const fetchDataFromAPI = async () => {
            setLoading(true)

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
                    console.log('DATA GENERAL: ', dataApi)
                    console.log('FECHA: ', dataApi[0].orderDate)
                    console.log('TRACKINGS: ', dataApi[0].trackings)

                    let dataFilter = filterAndRemoveDuplicates(dataApi[0].trackings, dataApi[0].shippingOrderType === 'PickupInPoint', dataApi[0].shippingOrderType === 'Regular')
                    dataFilter = {
                        ...dataFilter,
                        orderReferenceNumber: idOrder
                    }
                    console.log('TRACKING FILTRADA: ', dataFilter)
                    setData(dataFilter)
                }
            } catch (error) {
                setError('Formato de código incorrecto. Ingrese formato "XXXXXXXXXXXXXXXXXX"')
                console.log(error)
            } finally {
                setLoading(false)
            }

        };
        fetchDataFromAPI()
            .catch(console.error)

    }, [idOrder])


    const trackingItemsTpl = data.filteredTrackings.map((step, index) =>
        <li key={index} className={`flujoPedidosProfile_progressbar_bullet ${!isCancelled ? '' : 'red'} ${step.completed ? 'active' : ''}`} >
            <img className='flujoPedidosProfile_progressbar_iconChannel' src={step.icon} alt={step.alt} />
            <span className='flujoPedidosProfile_progressbar_text'>{step.title}</span>
            {step.completed && <span className='flujoPedidosProfile_progressbar_dateState'>{formatDate(step.createdOn)}</span>}
        </li>
    );

    return (

        <section className='flujoPedidosProfile_progressbar_wrap'>
            <div className='flujoPedidosProfile_progressbar_title'>
                <div className='flujoPedidosProfile_progressbar_titleIcon'>
                    <img className='flujoPedidosProfile_progressbar_titleIconImg' src="https://mercury.vteximg.com.br/arquivos/PNG_AGO_Trackings-Icon.png" alt="Icon Tracking" />
                </div>
                <h1 className='flujoPedidosProfile_progressbar_titleText'>Sigue el estado de tu pedido</h1>
                <p className='flujoPedidosProfile_progressbar_parrText'>👉 Con el <strong>código de seguimiento</strong> que está en <strong>tu correo</strong>, puedes rastrear tu pedido</p>
            </div>

            <div className='flujoPedidosProfile_searchWrap'>
                <div className='flujoPedidosProfile_search'>
                    <form className='flujoPedidosProfile__frm' onSubmit={handleSubmit}>
                        <input className='flujoPedidosProfile_search_input' value={value} onChange={handleSearchChange} type="text" placeholder="Ingresa aquí tu código de seguimiento" />
                        <button className='flujoPedidosProfile_search_btn' value={value} onClick={handleSubmitChange}>Buscar</button>
                    </form>
                </div>
            </div>

            {
                loading ? (<Loader />)
                    :
                    (
                        error ? <Message msg={error} bgColor='#e74c3c' /> : data.filteredTrackings.length > 0 && (
                            <div className='flujoPedidosProfile_progressbar_content'>
                                <div className='lujoPedidosProfile_progressbar_contentDetails'>
                                    <p className='flujoPedidosProfile_progressbar_idPedido'>N° de pedido: {data.orderReferenceNumber}</p>
                                    <p className='flujoPedidosProfile_progressbar_orderDate'>Fecha Realizada: {data.orderDate}</p>
                                </div>
                                <div className='lujoPedidosProfile_progressbar_contentTracking'>
                                    <ul className='flujoPedidosProfile_progressbar'>
                                        {trackingItemsTpl}
                                    </ul>
                                </div>
                            </div>
                        )
                    )
            }

        </section>

    )
}

export default Trackings