
export function Message ({msg, bgColor}) {
    let styles = {
        padding: '.7rem',
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontSize: '14px',
        backgroundColor: bgColor
    }

    return (
        <p style={styles}>{msg}</p>
    )
}

