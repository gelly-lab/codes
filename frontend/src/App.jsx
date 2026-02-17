import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  // 商品一覧を取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/products')
        setProducts(response.data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 商品詳細を表示
  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setCurrentPage('detail')
  }

  // カートに追加
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    
    alert(`${product.name} をカートに追加しました！`)
  }

  // カート内容を表示
  const handleViewCart = () => {
    setCurrentPage('cart')
  }

  // 購入手続き
  const handleCheckout = () => {
    setCurrentPage('checkout')
  }

  // 注文確定
  const handleOrder = async (email, name) => {
    try {
      const orderData = {
        email,
        name,
        items: cart,
        totalAmount: getTotalAmount()
      }
      
      const response = await axios.post('/api/orders', orderData)
      alert('注文が完了しました！\n注文番号: ' + response.data.orderId)
      
      // カートをクリア
      setCart([])
      setCurrentPage('home')
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('注文処理に失敗しました')
    }
  }

  // 合計金額を計算
  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  // ホームページ
  const renderHome = () => (
    <div className="container">
      <header className="header">
        <h1>� SaaS エコシステム</h1>
        <p className="tagline">Vibe Coding で開発効率を最大化するプロダクト群</p>
        <nav className="nav">
          <button onClick={() => setCurrentPage('home')} className={currentPage === 'home' ? 'active' : ''}>
            ホーム
          </button>
          <button onClick={handleViewCart} className={currentPage === 'cart' ? 'active' : ''}>
            カート ({cart.length})
          </button>
        </nav>
      </header>

      <main className="main">
        {loading ? (
          <p className="loading">読み込み中...</p>
        ) : (
          <>
            <div className="hero">
              <h2>開発チームの生産性を飛躍的に向上</h2>
              <p>AI駆動、自動化、そしてVibe Codingの感覚で、コーディングの未来を体験してください</p>
            </div>
            
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-logo">
                    {product.logo ? (
                      <img src={product.logo} alt={product.name} />
                    ) : (
                      <div className="product-icon">{product.emoji}</div>
                    )}
                  </div>
                  <div className="product-category">{product.category}</div>
                  <h3>{product.name}</h3>
                  <p className="description">{product.description}</p>
                  <p className="price">¥{product.price.toLocaleString()} / 月</p>
                  <div className="buttons">
                    <button 
                      className="btn-detail"
                      onClick={() => handleProductClick(product)}
                    >
                      詳細を見る
                    </button>
                    <button 
                      className="btn-cart"
                      onClick={() => addToCart(product)}
                    >
                      カートに追加
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )

  // 詳細ページ
  const renderDetail = () => (
    <div className="container">
      <header className="header">
        <h1>� SaaS エコシステム</h1>
        <nav className="nav">
          <button onClick={() => setCurrentPage('home')}>← 戻る</button>
          <button onClick={handleViewCart}>カート ({cart.length})</button>
        </nav>
      </header>

      <main className="main">
        {selectedProduct && (
          <div className="detail-container">
            <div className="detail-icon-container">
              {selectedProduct.logo ? (
                <img src={selectedProduct.logo} alt={selectedProduct.name} className="detail-logo" />
              ) : (
                <div className="detail-icon">{selectedProduct.emoji}</div>
              )}
            </div>
            <div className="detail-content">
              <div className="detail-category">{selectedProduct.category}</div>
              <h2>{selectedProduct.name}</h2>
              <p className="detail-tagline">{selectedProduct.description}</p>
              <p className="detail-price">¥{selectedProduct.price.toLocaleString()} / 月</p>
              
              <div className="detail-section">
                <h3>概要</h3>
                <p>{selectedProduct.longDescription}</p>
              </div>

              <div className="detail-section">
                <h3>主な機能</h3>
                <ul className="feature-list">
                  {selectedProduct.features?.map((feature, idx) => (
                    <li key={idx}>✨ {feature}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h3>対象ユーザー</h3>
                <p className="target-users">{selectedProduct.targetUsers}</p>
              </div>

              <div className="detail-actions">
                <button 
                  className="btn-cart-large"
                  onClick={() => {
                    addToCart(selectedProduct)
                    setCurrentPage('home')
                  }}
                >
                  💳 カートに追加
                </button>
                <button className="btn-demo">
                  🎮 デモを試す
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )

  // カートページ
  const renderCart = () => (
    <div className="container">
      <header className="header">
        <h1>🛍️ シンプルなECサイト</h1>
        <nav className="nav">
          <button onClick={() => setCurrentPage('home')}>← ショッピングを続ける</button>
        </nav>
      </header>

      <main className="main">
        <h2>ショッピングカート</h2>
        
        {cart.length === 0 ? (
          <p>カートは空です</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <span>{item.name}</span>
                  <span>×{item.quantity}</span>
                  <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                  <button 
                    className="btn-remove"
                    onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <h3>合計: ¥{getTotalAmount().toLocaleString()}</h3>
            </div>

            <button 
              className="btn-checkout"
              onClick={handleCheckout}
            >
              チェックアウト
            </button>
          </>
        )}
      </main>
    </div>
  )

  // チェックアウトページ
  const renderCheckout = () => (
    <div className="container">
      <header className="header">
        <h1>🛍️ シンプルなECサイト</h1>
      </header>

      <main className="main">
        <h2>チェックアウト</h2>
        <CheckoutForm onSubmit={handleOrder} cart={cart} total={getTotalAmount()} />
      </main>
    </div>
  )

  // ページ選択
  switch(currentPage) {
    case 'home':
      return renderHome()
    case 'detail':
      return renderDetail()
    case 'cart':
      return renderCart()
    case 'checkout':
      return renderCheckout()
    default:
      return renderHome()
  }
}

// チェックアウトフォームコンポーネント
function CheckoutForm({ onSubmit, cart, total }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(email, name)
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-group">
        <label>メールアドレス</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>氏名</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>支払い方法</label>
        <select>
          <option>クレジットカード</option>
          <option>銀行振込</option>
        </select>
      </div>

      <div className="order-summary">
        <h3>注文内容</h3>
        {cart.map(item => (
          <div key={item.id}>
            {item.name} ×{item.quantity} = ¥{(item.price * item.quantity).toLocaleString()}
          </div>
        ))}
        <h4>合計: ¥{total.toLocaleString()}</h4>
      </div>

      <button type="submit" className="btn-order">
        注文確定
      </button>
    </form>
  )
}

export default App
