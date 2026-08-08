<?php
/**
 * Fashion Zaragoza - Main Template
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

  <!-- ANNOUNCEMENT BAR -->
  <div class="announcement-bar">
    <p>✦ Envío gratuito en pedidos superiores a 60€ &nbsp;|&nbsp; Nueva colección Verano 2026 disponible &nbsp;|&nbsp; -20% en tu primera compra con código <strong>BIENVENIDA</strong> ✦</p>
  </div>

  <!-- NAVBAR -->
  <header class="navbar" id="navbar">
    <div class="nav-logo">
      <a href="<?php echo home_url(); ?>">FASHION <span>ZARAGOZA</span></a>
    </div>
    <nav class="nav-links">
      <a href="#colecciones">Colecciones</a>
      <a href="#novedades">Novedades</a>
      <a href="#lookbook">Lookbook</a>
      <a href="#categorias">Categorías</a>
      <a href="#sobre-nosotros">Nosotros</a>
    </nav>
    <div class="nav-actions">
      <button class="icon-btn" aria-label="Buscar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </button>
      <button class="icon-btn" aria-label="Mi cuenta">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </button>
      <button class="icon-btn cart-btn" aria-label="Carrito">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="cart-count">0</span>
      </button>
      <button class="hamburger" id="hamburger" aria-label="Menú"><span></span><span></span><span></span></button>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu">
    <button class="mobile-close" id="mobileClose">✕</button>
    <nav>
      <a href="#colecciones">Colecciones</a>
      <a href="#novedades">Novedades</a>
      <a href="#lookbook">Lookbook</a>
      <a href="#categorias">Categorías</a>
      <a href="#sobre-nosotros">Nosotros</a>
    </nav>
  </div>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-slide active" style="background-image:url('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1600&q=80')">
      <div class="hero-content">
        <p class="hero-subtitle">Nueva Colección</p>
        <h1 class="hero-title">Verano<br /><em>2026</em></h1>
        <p class="hero-desc">Elegancia que trasciende las estaciones</p>
        <div class="hero-btns">
          <a href="#novedades" class="btn btn-primary">Descubrir ahora</a>
          <a href="#lookbook" class="btn btn-outline">Ver Lookbook</a>
        </div>
      </div>
    </div>
    <div class="hero-slide" style="background-image:url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80')">
      <div class="hero-content">
        <p class="hero-subtitle">Exclusivo</p>
        <h1 class="hero-title">Colección<br /><em>Premium</em></h1>
        <p class="hero-desc">Prendas únicas para momentos especiales</p>
        <div class="hero-btns">
          <a href="#colecciones" class="btn btn-primary">Ver colección</a>
          <a href="#categorias" class="btn btn-outline">Explorar</a>
        </div>
      </div>
    </div>
    <div class="hero-slide" style="background-image:url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80')">
      <div class="hero-content">
        <p class="hero-subtitle">Tendencias 2026</p>
        <h1 class="hero-title">Moda que<br /><em>Inspira</em></h1>
        <p class="hero-desc">Fashion Zaragoza, tu destino de estilo</p>
        <div class="hero-btns">
          <a href="#categorias" class="btn btn-primary">Comprar ahora</a>
          <a href="#sobre-nosotros" class="btn btn-outline">Nuestra historia</a>
        </div>
      </div>
    </div>
    <div class="hero-controls">
      <button class="hero-prev" aria-label="Anterior">&#8592;</button>
      <div class="hero-dots"><span class="dot active"></span><span class="dot"></span><span class="dot"></span></div>
      <button class="hero-next" aria-label="Siguiente">&#8594;</button>
    </div>
  </section>

  <!-- STATS -->
  <section class="stats-bar">
    <div class="stat"><span class="stat-num">+2.500</span><span class="stat-label">Clientas felices</span></div>
    <div class="stat-divider"></div>
    <div class="stat"><span class="stat-num">+300</span><span class="stat-label">Prendas exclusivas</span></div>
    <div class="stat-divider"></div>
    <div class="stat"><span class="stat-num">10+</span><span class="stat-label">Años de experiencia</span></div>
    <div class="stat-divider"></div>
    <div class="stat"><span class="stat-num">100%</span><span class="stat-label">Satisfacción garantizada</span></div>
  </section>

  <!-- CATEGORÍAS -->
  <section class="categorias" id="categorias">
    <div class="section-header">
      <p class="section-tag">Explora</p>
      <h2 class="section-title">Nuestras Categorías</h2>
    </div>
    <div class="cat-grid">
      <a href="#novedades" class="cat-card cat-large" style="background-image:url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80')"><div class="cat-overlay"><h3>Mujer</h3><p>Ver colección →</p></div></a>
      <a href="#novedades" class="cat-card" style="background-image:url('https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&q=80')"><div class="cat-overlay"><h3>Hombre</h3><p>Ver colección →</p></div></a>
      <a href="#novedades" class="cat-card" style="background-image:url('https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80')"><div class="cat-overlay"><h3>Accesorios</h3><p>Ver colección →</p></div></a>
      <a href="#novedades" class="cat-card" style="background-image:url('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80')"><div class="cat-overlay"><h3>Bolsos</h3><p>Ver colección →</p></div></a>
      <a href="#novedades" class="cat-card" style="background-image:url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80')"><div class="cat-overlay"><h3>Calzado</h3><p>Ver colección →</p></div></a>
    </div>
  </section>

  <!-- PRODUCTOS -->
  <section class="novedades" id="novedades">
    <div class="section-header">
      <p class="section-tag">Recién llegado</p>
      <h2 class="section-title">Novedades de la Semana</h2>
      <p class="section-desc">Prendas seleccionadas por nuestros estilistas</p>
    </div>
    <div class="products-filter">
      <button class="filter-btn active" data-filter="all">Todo</button>
      <button class="filter-btn" data-filter="mujer">Mujer</button>
      <button class="filter-btn" data-filter="hombre">Hombre</button>
      <button class="filter-btn" data-filter="accesorios">Accesorios</button>
    </div>
    <div class="products-grid">
      <div class="product-card" data-category="mujer"><div class="product-img-wrap"><img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80" alt="Vestido Seda Natural" loading="lazy"/><div class="product-overlay"><button class="add-cart-btn">Añadir al carrito</button></div><span class="product-badge new">Nuevo</span></div><div class="product-info"><p class="product-brand">Colección SS26</p><h3 class="product-name">Vestido Seda Natural</h3><div class="product-price"><span>89,00 €</span></div><div class="product-colors"><span class="color" style="background:#c9a882"></span><span class="color" style="background:#2c2c2c"></span></div></div></div>
      <div class="product-card" data-category="mujer"><div class="product-img-wrap"><img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80" alt="Conjunto Lino Premium" loading="lazy"/><div class="product-overlay"><button class="add-cart-btn">Añadir al carrito</button></div><span class="product-badge sale">-20%</span></div><div class="product-info"><p class="product-brand">Colección SS26</p><h3 class="product-name">Conjunto Lino Premium</h3><div class="product-price"><span>72,00 €</span><span class="old-price">90,00 €</span></div></div></div>
      <div class="product-card" data-category="mujer"><div class="product-img-wrap"><img src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&q=80" alt="Blazer Estructurado" loading="lazy"/><div class="product-overlay"><button class="add-cart-btn">Añadir al carrito</button></div><span class="product-badge new">Nuevo</span></div><div class="product-info"><p class="product-brand">Colección SS26</p><h3 class="product-name">Blazer Estructurado</h3><div class="product-price"><span>115,00 €</span></div></div></div>
      <div class="product-card" data-category="hombre"><div class="product-img-wrap"><img src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=500&q=80" alt="Camisa Oxford" loading="lazy"/><div class="product-overlay"><button class="add-cart-btn">Añadir al carrito</button></div></div><div class="product-info"><p class="product-brand">Hombre SS26</p><h3 class="product-name">Camisa Oxford Premium</h3><div class="product-price"><span>65,00 €</span></div></div></div>
      <div class="product-card" data-category="accesorios"><div class="product-img-wrap"><img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80" alt="Bolso Cuero" loading="lazy"/><div class="product-overlay"><button class="add-cart-btn">Añadir al carrito</button></div><span class="product-badge new">Exclusivo</span></div><div class="product-info"><p class="product-brand">Accesorios</p><h3 class="product-name">Bolso Cuero Artesanal</h3><div class="product-price"><span>145,00 €</span></div></div></div>
      <div class="product-card" data-category="mujer"><div class="product-img-wrap"><img src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80" alt="Falda Plisada" loading="lazy"/><div class="product-overlay"><button class="add-cart-btn">Añadir al carrito</button></div><span class="product-badge sale">-15%</span></div><div class="product-info"><p class="product-brand">Colección SS26</p><h3 class="product-name">Falda Plisada Midi</h3><div class="product-price"><span>58,00 €</span><span class="old-price">68,00 €</span></div></div></div>
      <div class="product-card" data-category="hombre"><div class="product-img-wrap"><img src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80" alt="Traje Slim Fit" loading="lazy"/><div class="product-overlay"><button class="add-cart-btn">Añadir al carrito</button></div><span class="product-badge new">Nuevo</span></div><div class="product-info"><p class="product-brand">Hombre SS26</p><h3 class="product-name">Traje Slim Fit</h3><div class="product-price"><span>245,00 €</span></div></div></div>
      <div class="product-card" data-category="accesorios"><div class="product-img-wrap"><img src="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&q=80" alt="Gafas de Sol" loading="lazy"/><div class="product-overlay"><button class="add-cart-btn">Añadir al carrito</button></div></div><div class="product-info"><p class="product-brand">Accesorios</p><h3 class="product-name">Gafas de Sol Premium</h3><div class="product-price"><span>79,00 €</span></div></div></div>
    </div>
    <div class="view-more-wrap"><a href="#" class="btn btn-secondary">Ver todos los productos</a></div>
  </section>

  <!-- MID BANNER -->
  <section class="mid-banner">
    <div class="mid-banner-content">
      <p class="section-tag light">Edición limitada</p>
      <h2>Colección Cápsula<br /><em>Verano 2026</em></h2>
      <p>Piezas únicas inspiradas en la arquitectura y el arte de Zaragoza.</p>
      <a href="#novedades" class="btn btn-primary">Descubrir la colección</a>
    </div>
  </section>

  <!-- LOOKBOOK -->
  <section class="lookbook" id="lookbook">
    <div class="section-header">
      <p class="section-tag">Inspiración</p>
      <h2 class="section-title">Lookbook SS26</h2>
    </div>
    <div class="lookbook-grid">
      <div class="look-card look-tall"><img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80" alt="Casual Elegante" loading="lazy"/><div class="look-info"><h3>Casual Elegante</h3><p>Ver el look →</p></div></div>
      <div class="look-card"><img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=700&q=80" alt="Office Chic" loading="lazy"/><div class="look-info"><h3>Office Chic</h3><p>Ver el look →</p></div></div>
      <div class="look-card"><img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&q=80" alt="Weekend Vibes" loading="lazy"/><div class="look-info"><h3>Weekend Vibes</h3><p>Ver el look →</p></div></div>
      <div class="look-card look-tall"><img src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=700&q=80" alt="Summer Night" loading="lazy"/><div class="look-info"><h3>Summer Night</h3><p>Ver el look →</p></div></div>
      <div class="look-card"><img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=700&q=80" alt="Boho Luxury" loading="lazy"/><div class="look-info"><h3>Boho Luxury</h3><p>Ver el look →</p></div></div>
    </div>
  </section>

  <!-- TESTIMONIOS -->
  <section class="testimonios">
    <div class="section-header">
      <p class="section-tag">Opiniones reales</p>
      <h2 class="section-title">Lo que dicen nuestras clientas</h2>
    </div>
    <div class="testimonios-grid">
      <div class="testimonio-card"><div class="stars">★★★★★</div><p>"La calidad de las prendas es increíble. Compré un vestido para una boda y recibí cumplidos toda la noche."</p><div class="testimonio-author"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="María G."/><div><strong>María G.</strong><span>Zaragoza</span></div></div></div>
      <div class="testimonio-card featured"><div class="stars">★★★★★</div><p>"Llevo años comprando aquí y nunca me han decepcionado. El servicio personalizado es excepcional."</p><div class="testimonio-author"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" alt="Laura M."/><div><strong>Laura M.</strong><span>Zaragoza</span></div></div></div>
      <div class="testimonio-card"><div class="stars">★★★★★</div><p>"Los envíos son rapidísimos y el packaging es muy cuidado. Totalmente recomendable."</p><div class="testimonio-author"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" alt="Ana R."/><div><strong>Ana R.</strong><span>Madrid</span></div></div></div>
    </div>
  </section>

  <!-- SOBRE NOSOTROS -->
  <section class="sobre-nosotros" id="sobre-nosotros">
    <div class="sobre-img"><img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=900&q=80" alt="Nuestra tienda" loading="lazy"/></div>
    <div class="sobre-content">
      <p class="section-tag">Nuestra historia</p>
      <h2>Más de una década<br />vistiendo a Zaragoza</h2>
      <p>Fashion Zaragoza nació de una pasión profunda por la moda y el compromiso de traer a nuestra ciudad las tendencias más actuales con la calidad que te mereces.</p>
      <p>Cada prenda es seleccionada cuidadosamente por nuestro equipo de estilistas, priorizando materiales sostenibles y diseños atemporales.</p>
      <div class="sobre-features">
        <div class="feature"><span class="feature-icon">♦</span><div><strong>Calidad Premium</strong><p>Solo trabajamos con proveedores certificados</p></div></div>
        <div class="feature"><span class="feature-icon">♦</span><div><strong>Moda Sostenible</strong><p>Comprometidos con el medio ambiente</p></div></div>
        <div class="feature"><span class="feature-icon">♦</span><div><strong>Asesoría Personal</strong><p>Nuestras estilistas están para ayudarte</p></div></div>
      </div>
      <a href="#novedades" class="btn btn-primary">Conoce nuestra colección</a>
    </div>
  </section>

  <!-- INSTAGRAM -->
  <section class="instagram">
    <div class="section-header">
      <p class="section-tag">@fashionzaragoza</p>
      <h2 class="section-title">Síguenos en Instagram</h2>
    </div>
    <div class="insta-grid">
      <a href="#" class="insta-item"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" alt="Instagram 1" loading="lazy"/><div class="insta-overlay">♥ 234</div></a>
      <a href="#" class="insta-item"><img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80" alt="Instagram 2" loading="lazy"/><div class="insta-overlay">♥ 412</div></a>
      <a href="#" class="insta-item"><img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80" alt="Instagram 3" loading="lazy"/><div class="insta-overlay">♥ 187</div></a>
      <a href="#" class="insta-item"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80" alt="Instagram 4" loading="lazy"/><div class="insta-overlay">♥ 563</div></a>
      <a href="#" class="insta-item"><img src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80" alt="Instagram 5" loading="lazy"/><div class="insta-overlay">♥ 298</div></a>
      <a href="#" class="insta-item"><img src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80" alt="Instagram 6" loading="lazy"/><div class="insta-overlay">♥ 341</div></a>
    </div>
  </section>

  <!-- NEWSLETTER -->
  <section class="newsletter">
    <div class="newsletter-content">
      <p class="section-tag light">Únete a nuestra comunidad</p>
      <h2>Sé la primera en descubrir<br />las nuevas colecciones</h2>
      <p>Suscríbete y recibe un <strong>20% de descuento</strong> en tu primera compra</p>
      <form class="newsletter-form" onsubmit="handleNewsletter(event)">
        <input type="email" placeholder="Tu correo electrónico" required aria-label="Email newsletter"/>
        <button type="submit" class="btn btn-primary">Suscribirme</button>
      </form>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-brand">
        <h3>FASHION <span>ZARAGOZA</span></h3>
        <p>Tu destino de moda premium en el corazón de Aragón. Elegancia, calidad y tendencia desde 2014.</p>
        <div class="social-links">
          <a href="https://www.instagram.com/its.maryfashion" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
          <a href="https://www.youtube.com/@Maryvargas-ez6gm" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg></a>
          <a href="https://www.tiktok.com/@mary.vargas6924" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a>
        </div>
      </div>
      <div class="footer-links"><h4>Tienda</h4><ul><li><a href="#">Novedades</a></li><li><a href="#">Mujer</a></li><li><a href="#">Hombre</a></li><li><a href="#">Accesorios</a></li></ul></div>
      <div class="footer-links"><h4>Ayuda</h4><ul><li><a href="#">Mi cuenta</a></li><li><a href="#">Devoluciones</a></li><li><a href="#">Guía de tallas</a></li><li><a href="#">Contacto</a></li></ul></div>
      <div class="footer-contact"><h4>Visítanos</h4><p>📍 Calle Alfonso I, 24<br/>50003 Zaragoza, España</p><p>📞 +34 976 123 456</p><p>✉️ maryvar116@gmail.com</p><p>🕐 Lun–Sáb: 10:00–21:00</p></div>
    </div>
    <div class="footer-bottom">
      <p>© <?php echo date('Y'); ?> Fashion Zaragoza. Todos los derechos reservados.</p>
      <p class="footer-love">Hecho con amor por Marisol Vargas ♥</p>
      <div class="footer-legal"><a href="#">Aviso Legal</a><a href="#">Privacidad</a><a href="#">Cookies</a></div>
    </div>
  </footer>

  <div class="cart-toast" id="cartToast"><span>✓ Añadido al carrito</span></div>
  <button class="back-to-top" id="backToTop" aria-label="Volver arriba">↑</button>

<?php wp_footer(); ?>
</body>
</html>
