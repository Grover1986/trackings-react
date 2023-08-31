import './Trackings.css'
import { formatDate } from '../utils'
import { Loader } from '../Loader/Loader'
import { Message } from '../Message'
import { useState, useEffect } from 'react'
// const regex = new RegExp(/\d{1,}-\d{2}/g)

function Trackings() {

    const [idOrder, setIdOrder] = useState('')
    const [data, setData] = useState({ filteredTrackings: [] })
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // esta función cambia de valor el value del Input
    const handleSearchChange = (event) => {
        setValue(event.currentTarget.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        
        if (value.trim() === '') {
            console.log('NO hay datos')
            setError('El campo no puede estar vacío')
        }else {
            console.log('Valor del Input:', value)
            setIdOrder(value)
            setError(null)
            setValue('')
        }
    }

    // esta función cambia de valor de idOrder
    const handleSubmitChange = () => {
        setIdOrder(value)
    }

    function filterAndRemoveDuplicates(trackings) {
        const filteredTrackings = trackings.filter((tracking, index, self) => {
            // Filtrar los elementos con title diferente de "Envío correo"
            if (tracking.title !== "Envío correo") {
                // Verificar si el elemento actual es el primer duplicado de title
                const firstIndex = self.findIndex((t) => t.title === tracking.title);
                return index === firstIndex;
            }
            return false;
        });
        return {
            filteredTrackings,
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
                    const response = await fetch(`https://api-core-shopstar.azure-api.net/sales/orders/view/${idOrder}`, requestOptions);
                    const dataApi = await response.json();
                    console.log('TRACKINGS: ', dataApi.trackings)
                    let dataFilter = filterAndRemoveDuplicates(dataApi.trackings)
                    dataFilter = {
                        ...dataFilter,
                        orderReferenceNumber: idOrder
                    }
                    console.log('TRACKING FILTRADA: ', dataFilter)
                    setData(dataFilter)
                }
            } catch (error) {
                setError('Formato de código incorrecto. Ingrese formato "XXXXXXXXXXXX-XX"')
            } finally {
                setLoading(false)
            }      

        };
        fetchDataFromAPI()
            .catch(console.error)

    }, [idOrder])

    const isTrackingActive = (dataIndex) => {
        const dataIndexValid = dataIndex >= 0 && dataIndex < data.filteredTrackings.length;

        if (!dataIndexValid) {
            return false;
        }

        const trackingData = data.filteredTrackings[dataIndex];
        const isCompleted = trackingData.completed;

        return isCompleted;
    };

    return (

        <section className='flujoPedidosProfile_progressbar_wrap'>
            <div className='flujoPedidosProfile_progressbar_title'>
                <svg xmlns="http://www.w3.org/2000/svg" width="37.156" height="25.587" viewBox="0 0 37.156 25.587">
                    <g id="Grupo_96" data-name="Grupo 96" transform="translate(-262 -344)">
                        <path id="Trazado_5283" data-name="Trazado 5283" d="M85.349,116.575a6.782,6.782,0,0,0-5.062-2.124H75.474v-2.6a1.152,1.152,0,0,0-1.148-1.148H51.4a1.152,1.152,0,0,0-1.148,1.148v20.286a1.152,1.152,0,0,0,1.148,1.148h3.493a3.856,3.856,0,0,0,7.521,0h13.76a3.856,3.856,0,0,0,7.521,0h2.564a1.152,1.152,0,0,0,1.148-1.148v-9.54A8.7,8.7,0,0,0,85.349,116.575ZM58.652,134a1.56,1.56,0,1,1,1.56-1.56A1.56,1.56,0,0,1,58.652,134Zm14.535-18.4V131H62.374a.724.724,0,0,0-.144.01,3.85,3.85,0,0,0-7.158.019,1.1,1.1,0,0,0-.249-.029H52.556v-4.009h0V113H73.187ZM79.933,134a1.56,1.56,0,1,1,1.56-1.56A1.56,1.56,0,0,1,79.933,134Zm5.177-3H83.5a3.847,3.847,0,0,0-7.138,0h-.88V116.748H80.3c3.014,0,4.813,2.191,4.813,5.856Z" transform="translate(211.75 233.3)" fill="#13284c" />
                    </g>
                </svg>
                <h1 className='flujoPedidosProfile_progressbar_titleText'>Sigue el estado de tu pedido</h1>
                <p className='flujoPedidosProfile_progressbar_parrText'>Ingresa el código de seguimiento que llegó a tu correo</p>
            </div>

            <div className='flujoPedidosProfile_searchWrap'>
                <div className='flujoPedidosProfile_search'>
                    <form className='flujoPedidosProfile__frm' onSubmit={handleSubmit}>
                        <input className='flujoPedidosProfile_search_input' value={value} onChange={handleSearchChange} type="text" placeholder="1XXXXXXXXXXXX-01" />
                        <button className='flujoPedidosProfile_search_btn' value={value} onClick={handleSubmitChange}>Buscar</button>
                    </form>
                </div>
            </div>

            <div className='flujoPedidosProfile_progressbar_content'>
                {
                    loading ? (<Loader />) 
                    : 
                        (
                            error ? <Message msg={error} bgColor='#e74c3c' /> : data.filteredTrackings.length > 0 && (
                                <>
                                    <h2>{data.orderReferenceNumber}</h2>
                                    <h2 className='flujoPedidosProfile_progressbar_sbtitleTrackings'>Estado del pedido</h2>
                                    <ul className='flujoPedidosProfile_progressbar'>
                                        <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(4) ? 'red' : isTrackingActive(0) ? 'active' : ''}`}>
                                            <span className={`flujoPedidosProfile_progressbar_text`}>Pedido Registrado</span>
                                            <span>{formatDate(data.filteredTrackings[0].createdOn)}</span>
                                        </li>
                                        <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(4) ? 'red' : isTrackingActive(1) ? 'active' : ''}`}>
                                            <span className='flujoPedidosProfile_progressbar_text'>Pedido Confirmado</span>
                                        </li>
                                        <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(4) ? 'red' : isTrackingActive(2) ? 'active' : ''}`}>
                                            <span className='flujoPedidosProfile_progressbar_text'>Pedido listo para Recoger</span>
                                        </li>
                                        <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(4) ? 'red' : isTrackingActive(3) ? 'active' : ''}`}>
                                            <span className='flujoPedidosProfile_progressbar_text'>Pedido Entregado</span>
                                        </li>
                                        <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(4) && 'red'}`}>
                                            <span className='flujoPedidosProfile_progressbar_text'>Pedido Cancelado</span>
                                        </li>
                                    </ul>
                                </>
                            )
                        ) 
                }
            </div>
        </section>

    )
}

export default Trackings

//                                            {data.filter((el) => (
//    el.title === 'Nuevo pedido' && <span>{el.title}</span>
//    ))}