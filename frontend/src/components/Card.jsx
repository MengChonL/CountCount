const Card = ({ children, title, extra }) => {
    const cardStyle = {
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      border: '1px solid #eaeaea',
      marginBottom: '20px'
    };
  
    const headerStyle = {
      padding: '16px 20px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    };
  
    return (
      <div style={cardStyle}>
        {(title || extra) && (
          <div style={headerStyle}>
            {title && <h2 style={{ margin: 0, fontSize: '18px' }}>{title}</h2>}
            {extra && <div>{extra}</div>}
          </div>
        )}
        <div style={{ padding: '0' }}>
          {children}
        </div>
      </div>
    );
  };
  
  export default Card;