import './Trackings.css'
import { Loader } from '../Loader/Loader'
import { OrderTracking } from '../OrderTracking/OrderTracking'
import { Message } from '../Message'
import { useState, useEffect } from 'react'

function Trackings() {

    const [idOrder, setIdOrder] = useState('')
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [orderList, setOrders] = useState(false)

    // esta función cambia de valor el value del Input
    const handleSearchChange = (event) => {
        const trimmedValue = event.currentTarget.value.trim();
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
        const trimmedValue = value.trim();
        setIdOrder(trimmedValue);
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

                    setOrders(dataApi);
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
                        error ? <Message msg={error} bgColor='#e74c3c' /> : (orderList && orderList.length > 0 && (
                            orderList.map((order, index) => {
                                return <OrderTracking key={index} order={order}></OrderTracking>
                            }))
                        )
                    )
            }

        </section>

    )
}

export default Trackings