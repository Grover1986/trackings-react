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

    function filterAndRemoveDuplicates(trackings) {
        const filteredTrackings = trackings.filter((tracking, index, self) => {
            // Filtrar los elementos con title diferente de "Envío correo"
            if (tracking.title !== "Envío correo" && tracking.title !== "En preparación") {
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
                    const response = await fetch(`https://api-core-shopstar.azure-api.net/sales/orders/view-group//${idOrder}`, requestOptions);
                    const dataApi = await response.json();
                    console.log('DATA GENERAL: ', dataApi)
                    console.log('TRACKINGS: ', dataApi[0].trackings)
                    let dataFilter = filterAndRemoveDuplicates(dataApi[0].trackings)
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
        // const dataIndexValid = dataIndex >= 0 && dataIndex < data.filteredTrackings.length;

        // if (!dataIndexValid) {
        //     return false;
        // }

        const trackingData = data.filteredTrackings[dataIndex];
        const isCompleted = trackingData.completed;
        return isCompleted;
    };

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
                                // <>
                                <div className='flujoPedidosProfile_progressbar_content'>
                                    <div className='lujoPedidosProfile_progressbar_contentDetails'>
                                        <h2 className='flujoPedidosProfile_progressbar_idPedido'>{data.orderReferenceNumber}</h2>
                                    </div>
                                    <div className='lujoPedidosProfile_progressbar_contentTracking'>
                                        <ul className='flujoPedidosProfile_progressbar'>
                                            <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(1) ? 'red' : isTrackingActive(0) ? 'active' : ''}`}>
                                                <span className={`flujoPedidosProfile_progressbar_text`}>Pedido Registrado</span>
                                                {/* <span>{formatDate(data.filteredTrackings[0].createdOn)}</span> */}
                                            </li>
                                            <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(1) ? 'red' : isTrackingActive(2) ? 'active' : ''}`}>
                                                <span className='flujoPedidosProfile_progressbar_text'>Pedido confirmado</span>
                                            </li>
                                            <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(1) ? 'red' : isTrackingActive(3) ? 'active' : ''}`}>
                                                <span className='flujoPedidosProfile_progressbar_text'>Pedido listo para Recoger</span>
                                            </li>
                                            <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(1) ? 'red' : isTrackingActive(5) ? 'active' : ''}`}>
                                                <span className='flujoPedidosProfile_progressbar_text'>Pedido Entregado</span>
                                            </li>
                                            <li className={`flujoPedidosProfile_progressbar_bullet ${isTrackingActive(1) && 'red'}`}>
                                                <span className='flujoPedidosProfile_progressbar_text'>Pedido cancelado</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                // </>
                            )
                        )
                }

        </section>

    )
}

export default Trackings

//                                            {data.filter((el) => (
//    el.title === 'Nuevo pedido' && <span>{el.title}</span>
//    ))}