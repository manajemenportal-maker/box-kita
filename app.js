// Bootstrap sengaja memakai JavaScript biasa + dynamic import agar mode simulasi tetap
// berjalan tanpa mengunduh SDK Firebase. Ini juga memungkinkan index.html dibuka lokal.
(async function boxkitaBoot(){
let initializeApp, getApps, deleteApp, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, inMemoryPersistence, signOut, onAuthStateChanged;
let getFirestore, collection, doc, getDoc, getDocs, query, where, addDoc, setDoc, updateDoc, writeBatch, runTransaction, serverTimestamp;
let firebaseInitializationError = null;

// Konfigurasi aplikasi Web BoxKita dari Firebase Console > Project settings > Your apps.
// Firebase web config berada di client; keamanan data ditegakkan oleh Firestore Security Rules dan validasi transaksi admin.
const firebaseConfig = {
  apiKey: 'AIzaSyDmFLZ9OClSRPac_z7kKfYt5QfNn-C4MqY',
  authDomain: 'box-kita.firebaseapp.com',
  projectId: 'box-kita',
  storageBucket: 'box-kita.firebasestorage.app',
  messagingSenderId: '362904728303',
  appId: '1:362904728303:web:7b35e23c543cc2978e211a',
  measurementId: 'G-YLYESZ5N20'
};
// Ganti nomor ini dengan WhatsApp pengelola: kode negara, tanpa tanda +, spasi, atau angka 0 awal.
const WA_ADMIN = '628XXXXXXXXXX'; // Nomor pengelola belum diisi; checkout simulasi tetap dapat digunakan.
// Isi detail rekening resmi pengelola sebelum website dipublikasikan. Jangan gunakan nomor contoh.
const PAYMENT_INFO = { bankName: 'Atur nama bank di app.js', accountName: 'Atur nama pemilik rekening', accountNo: 'Atur nomor rekening' };
const IS_DEMO = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY' || !firebaseConfig.projectId || firebaseConfig.projectId === 'YOUR_PROJECT_ID' || !firebaseConfig.appId || firebaseConfig.appId === 'YOUR_APP_ID';
let app = null, auth = null, db = null;
if (!IS_DEMO) {
  try {
    const [appSdk, authSdk, dbSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js')
    ]);
    ({initializeApp, getApps, deleteApp} = appSdk);
    ({getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, inMemoryPersistence, signOut, onAuthStateChanged} = authSdk);
    ({getFirestore, collection, doc, getDoc, getDocs, query, where, addDoc, setDoc, updateDoc, writeBatch, runTransaction, serverTimestamp} = dbSdk);
    app = initializeApp(firebaseConfig); auth = getAuth(app); db = getFirestore(app);
    // Analytics hanya dijalankan pada browser yang didukung; kegagalan Analytics tidak mematikan aplikasi.
    try {
      const analyticsSdk = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js');
      if (await analyticsSdk.isSupported()) analyticsSdk.getAnalytics(app);
    } catch (analyticsError) {
      console.warn('Firebase Analytics tidak tersedia di browser ini; fitur toko tetap berjalan.', analyticsError);
    }
  } catch (error) {
    firebaseInitializationError = error;
    console.error('Firebase SDK gagal dimuat:', error);
  }
}

const SERVICE_AREAS = ["Jakarta","Jakarta Pusat","Jakarta Utara","Jakarta Barat","Jakarta Selatan","Jakarta Timur","Kepulauan Seribu","Tangerang","Kota Tangerang","Kabupaten Tangerang","Tangerang Selatan","Serpong","BSD City","Ciputat","Pamulang","Pondok Aren","Depok","Bekasi","Kota Bekasi","Kabupaten Bekasi","Bogor","Kota Bogor","Kabupaten Bogor"];
const SIM_STORAGE_KEY = 'boxkita_simulation_v12';
const LEGACY_SIM_STORAGE_KEY = 'boxkita_simulation_v9';
const OLDER_SIM_STORAGE_KEY = 'boxkita_simulation_v5';
function normalizeArea(area, fallback='Jakarta') {
  const text = String(area || '').trim();
  if (SERVICE_AREAS.includes(text)) return text;
  const aliases = {'Semua wilayah':fallback,'Jabodetabek':fallback,'Jabodetabek semua':fallback,'Kota Tangerang Selatan':'Tangerang Selatan','Tangerang Selatan (Serpong)':'Serpong','Tangerang Kota':'Kota Tangerang','Kab. Tangerang':'Kabupaten Tangerang','Bekasi Kota':'Kota Bekasi','Kab. Bekasi':'Kabupaten Bekasi','Bogor Kota':'Kota Bogor','Kab. Bogor':'Kabupaten Bogor'};
  const mapped=aliases[text];
  if (mapped && SERVICE_AREAS.includes(mapped)) return mapped;
  return SERVICE_AREAS.includes(fallback) ? fallback : 'Jakarta';
}
function areaSelectOptions(selected='Jakarta') {
 const safeSelected=normalizeArea(selected);
 return SERVICE_AREAS.map(area=>`<option value="${escapeHtml(area)}" ${area===safeSelected?'selected':''}>${escapeHtml(area)}</option>`).join('');
}
const seedProducts = [
  { id:'sample-jumat-barokah', name:'Nasi Box Jumat Barokah', description:'Paket Jumat untuk berbagi: nasi putih, lauk pilihan, sayur, sambal, dan pelengkap. Komposisi dapat disesuaikan bersama pengelola.', category:'Jumat Barokah', sellerName:'Dapur Barokah', partnerId:'sample-barokah', area:'Jakarta Pusat', salePrice:15000, imageUrl:'', emoji:'🤲', status:'active', stock:100, sort:0 },
  { id:'sample-boxkita-3kue', name:'BoxKita Snack Box 3 Kue', description:'Isi contoh: lemper, pastel, dan kue lapis. Susunan kue dapat dikonfirmasi sesuai ketersediaan mitra.', category:'Box Kita', sellerName:'Dapur Kue BoxKita', partnerId:'sample-kue', area:'Kota Tangerang', salePrice:12000, imageUrl:'', emoji:'🍰', status:'active', stock:100, sort:1 },
  { id:'sample-boxkita-4kue', name:'BoxKita Snack Box 4 Kue', description:'Isi contoh: lemper, pastel, risoles, dan bolu kukus. Cocok untuk rapat, arisan, dan acara keluarga.', category:'Box Kita', sellerName:'Dapur Kue BoxKita', partnerId:'sample-kue', area:'Serpong', salePrice:18000, imageUrl:'', emoji:'🧁', status:'active', stock:100, sort:2 },
  { id:'sample-boxkita-premium', name:'BoxKita Snack Box Premium', description:'Paket contoh aneka kudapan: lemper, risoles, pastel, kue sus, dan brownies. Isi akhir disepakati berdasarkan pesanan.', category:'Box Kita', sellerName:'Dapur Kue BoxKita', partnerId:'sample-kue', area:'Depok', salePrice:25000, imageUrl:'', emoji:'🍱', status:'active', stock:80, sort:3 },
  { id:'sample-ayam-bakar', name:'Nasi Box Ayam Bakar', description:'Ayam bakar, nasi putih, lalapan, sambal, dan kerupuk.', category:'Ayam', sellerName:'Dapur Bu Rina', partnerId:'sample-rina', area:'Jakarta Selatan', salePrice:25000, imageUrl:'', emoji:'🍗', status:'active', stock:100, sort:1 },
  { id:'sample-geprek', name:'Nasi Box Ayam Geprek', description:'Ayam geprek, nasi hangat, tumis sayur, dan sambal.', category:'Ayam', sellerName:'Dapur Nusantara', partnerId:'sample-nusantara', area:'Kota Bekasi', salePrice:22000, imageUrl:'', emoji:'🍱', status:'active', stock:120, sort:2 },
  { id:'sample-ikan-kuning', name:'Nasi Box Ikan Bumbu Kuning', description:'Ikan berbumbu, nasi, urap sayur, dan pelengkap.', category:'Ikan', sellerName:'Dapur Nusantara', partnerId:'sample-nusantara', area:'Kota Bogor', salePrice:27000, imageUrl:'', emoji:'🐟', status:'active', stock:60, sort:3 },
  { id:'sample-rendang', name:'Nasi Box Rendang', description:'Rendang sapi, nasi, sayur, sambal, dan kerupuk.', category:'Sapi', sellerName:'Dapur Bu Rina', partnerId:'sample-rina', area:'Tangerang Selatan', salePrice:32000, imageUrl:'', emoji:'🥘', status:'active', stock:70, sort:4 },
  { id:'sample-hemat', name:'Paket Hemat Ayam Suwir', description:'Ayam suwir, nasi, oseng sayur, dan sambal.', category:'Paket Hemat', sellerName:'Dapur Bu Rina', partnerId:'sample-rina', area:'Kabupaten Tangerang', salePrice:18000, imageUrl:'', emoji:'🍛', status:'active', stock:150, sort:5 },
  { id:'sample-sehat', name:'Nasi Box Sehat Sayur', description:'Nasi, tempe, tahu, sayuran segar, dan sambal.', category:'Vegetarian', sellerName:'Sehat Bersama', partnerId:'sample-sehat', area:'Bogor', salePrice:23000, imageUrl:'', emoji:'🥗', status:'active', stock:45, sort:6 },
  { id:'sample-kecap', name:'Nasi Box Ayam Kecap', description:'Ayam kecap, nasi, capcay, dan pelengkap.', category:'Ayam', sellerName:'Dapur Nusantara', partnerId:'sample-nusantara', area:'Jakarta Barat', salePrice:24000, imageUrl:'', emoji:'🍗', status:'active', stock:90, sort:7 },
  { id:'sample-ikan-goreng', name:'Nasi Box Ikan Goreng', description:'Ikan goreng, nasi, tumis buncis, sambal, dan lalapan.', category:'Ikan', sellerName:'Sehat Bersama', partnerId:'sample-sehat', area:'Kabupaten Bekasi', salePrice:26000, imageUrl:'', emoji:'🐠', status:'active', stock:50, sort:8 }
];
const seedPartners = [
  {id:'sample-barokah',name:'Dapur Barokah',contactName:'Pengelola Dapur Barokah',phone:'',area:'Jakarta',capacity:'101–300 box/hari',specialty:'Paket Jumat Barokah',status:'active'},
  {id:'sample-kue',name:'Dapur Kue BoxKita',contactName:'Pengelola Dapur Kue BoxKita',phone:'',area:'Tangerang',capacity:'31–100 box/hari',specialty:'Snack box aneka kue basah dan kudapan',status:'active'},
  {id:'sample-rina',name:'Dapur Bu Rina',contactName:'Bu Rina',phone:'',area:'Serpong',capacity:'31–100 box/hari',specialty:'Masakan rumahan',status:'active'},
  {id:'sample-nusantara',name:'Dapur Nusantara',contactName:'Pengelola Dapur',phone:'',area:'Depok',capacity:'101–300 box/hari',specialty:'Masakan Indonesia',status:'active'},
  {id:'sample-sehat',name:'Sehat Bersama',contactName:'Tim Sehat Bersama',phone:'',area:'Bogor',capacity:'31–100 box/hari',specialty:'Menu sayur dan vegetarian',status:'active'}
];
let simulationState = null;
function defaultSimulationState(){
 const seededProducts = seedProducts.map(p=>({...p,area:normalizeArea(p.area),costPrice:Math.max(1000,Math.round((Number(p.salePrice||0)-Math.max(2500,Number(p.salePrice||0)*0.25))/500)*500),updatedAt:new Date().toISOString(),createdAt:new Date().toISOString(),status:'active'}));
 return {products:seededProducts,partners:seedPartners.map(p=>({...p,area:normalizeArea(p.area),status:'active'})),orders:[],applications:[],settlements:[],createdAt:new Date().toISOString()};
}
function getSimulationState(){
 if(!IS_DEMO)return null;
 if(simulationState)return simulationState;
 try {
  let saved=JSON.parse(localStorage.getItem(SIM_STORAGE_KEY)||'null');
  if(!saved){
   const legacy=JSON.parse(localStorage.getItem(LEGACY_SIM_STORAGE_KEY)||localStorage.getItem(OLDER_SIM_STORAGE_KEY)||'null');
   if(legacy&&Array.isArray(legacy.products)&&Array.isArray(legacy.partners)){
    saved={...legacy,products:legacy.products.map(p=>({...p,area:normalizeArea(p.area),status:'active'})),partners:legacy.partners.map(p=>({...p,area:normalizeArea(p.area),status:'active'}))};
    localStorage.setItem(SIM_STORAGE_KEY,JSON.stringify(saved));
   }
  }
  if(saved&&Array.isArray(saved.products)&&Array.isArray(saved.partners))simulationState=saved;
 } catch(error){console.warn('Could not read simulation data',error);}
 if(!simulationState){simulationState=defaultSimulationState();persistSimulation();}
 return simulationState;
}
function persistSimulation(){if(!IS_DEMO||!simulationState)return;try{localStorage.setItem(SIM_STORAGE_KEY,JSON.stringify(simulationState));}catch(error){console.warn('Could not save simulation data',error);showToast('Penyimpanan browser penuh atau dinonaktifkan.');}}
function simulationId(prefix){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`.toUpperCase();}
function localStamp(){return new Date().toISOString();}
let products = [], partners = [], orders = [], applications = [], settlements = [], cart = {}, selectedCategory = 'all', currentAdmin = null, currentSessionUser = null, currentProfile = null, currentRole = null, activeView = 'overview', roleDashboardView = 'overview', lastOrderMessage = '', cachedModalSubmit = null, authRouteSequence = 0, analyticsPeriod = '30';
const byId = id => document.getElementById(id);

// Navigasi situs dibuat satu sumber: link desktop dan mobile menunjuk ke bagian halaman yang sama.
const SITE_NAV_IDS = ['program-jumat', 'program-box-kita', 'menu', 'cara', 'mitra', 'gabung'];
const SITE_NAV_SELECTOR = '[data-site-nav]';
function closeMobileNav() {
  const panel = byId('mobileNav');
  const trigger = byId('mobileMenuBtn');
  if (panel) panel.classList.add('hidden');
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Buka navigasi');
  }
}
function setActiveSiteNav(sectionId) {
  document.querySelectorAll(SITE_NAV_SELECTOR).forEach(link => {
    const active = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('is-current', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function scrollToSiteSection(sectionId, pushHistory = false) {
  const target = byId(sectionId);
  if (!target) return;
  closeMobileNav();
  if (pushHistory && window.location.hash !== `#${sectionId}`) {
    window.history.pushState({boxKitaSection: sectionId}, '', `#${sectionId}`);
  }
  const header = byId('siteTopbar');
  const offset = (header ? header.getBoundingClientRect().height : 78) + 12;
  const destination = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top: destination, behavior: reducedMotion ? 'auto' : 'smooth'});
  setActiveSiteNav(sectionId);
}
function updateSiteNavFromScroll() {
  const header = byId('siteTopbar');
  const threshold = (header ? header.getBoundingClientRect().height : 78) + 20;
  const first = byId(SITE_NAV_IDS[0]);
  let activeId = null;
  for (const id of SITE_NAV_IDS) {
    const section = byId(id);
    if (!section) continue;
    if (section.getBoundingClientRect().top <= threshold) activeId = id;
    else break;
  }
  // Di bagian akhir halaman, pilih bagian nav terdekat walau batas scroll mencegahnya mencapai atas layar.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) {
    const nearest = SITE_NAV_IDS.map(id => ({id, top: byId(id)?.getBoundingClientRect().top ?? Infinity}))
      .filter(item => Number.isFinite(item.top))
      .sort((a, b) => Math.abs(a.top - threshold) - Math.abs(b.top - threshold))[0];
    if (nearest) activeId = nearest.id;
  }
  if (first && window.scrollY < first.offsetTop - threshold - 40) activeId = null;
  document.querySelectorAll(SITE_NAV_SELECTOR).forEach(link => {
    const active = link.getAttribute('href') === (activeId ? `#${activeId}` : '');
    link.classList.toggle('is-current', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
let siteNavScrollTick = false;
window.addEventListener('scroll', () => {
  if (siteNavScrollTick) return;
  siteNavScrollTick = true;
  window.requestAnimationFrame(() => { updateSiteNavFromScroll(); siteNavScrollTick = false; });
}, {passive: true});
window.addEventListener('resize', updateSiteNavFromScroll, {passive: true});
window.addEventListener('popstate', () => {
  const id = window.location.hash.slice(1);
  if (SITE_NAV_IDS.includes(id)) scrollToSiteSection(id, false);
  else updateSiteNavFromScroll();
});
document.querySelectorAll(SITE_NAV_SELECTOR).forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  scrollToSiteSection(link.getAttribute('href').slice(1), true);
}));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMobileNav(); });
document.addEventListener('click', event => {
  const panel = byId('mobileNav');
  if (panel && !panel.classList.contains('hidden') && !event.target.closest('#siteTopbar')) closeMobileNav();
});
updateSiteNavFromScroll();
const money = value => 'Rp' + Math.round(Number(value || 0)).toLocaleString('id-ID');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate = value => { if (!value) return '—'; const d = value?.toDate ? value.toDate() : (value instanceof Date ? value : new Date(value)); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}); };
const formatDateTime = value => { if (!value) return '—'; const d = value?.toDate ? value.toDate() : (value instanceof Date ? value : new Date(value)); return isNaN(d.getTime()) ? '—' : d.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); };
const getVal = (form, name) => String(new FormData(form).get(name) || '').trim();
const isConfiguredWA = () => /^62\d{8,15}$/.test(WA_ADMIN) && !WA_ADMIN.includes('X');
const showToast = message => { const toast = byId('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 3100); };
const setBusy = (busy, text='Memproses…') => { byId('busyText').textContent = text; byId('globalBusy').classList.toggle('hidden', !busy); };
const openModal = id => byId(id).classList.add('show');
const closeModal = id => byId(id).classList.remove('show');
const stockLabel = p => Number(p.stock ?? 999999) <= 0 ? 'Habis' : 'Tersedia';
const statusLabel = value => ({new:'Pesanan baru',confirmed:'Dikonfirmasi',preparing:'Disiapkan',ready:'Siap dikirim',delivered:'Selesai/terkirim',cancelled:'Dibatalkan',unpaid:'Belum dibayar',paid:'Sudah dibayar',refunded:'Dikembalikan',pending:'Menunggu tinjauan',active:'Aktif',paused:'Nonaktif',rejected:'Ditolak',approved:'Disetujui'}[value] || value || '—');
const statusClass = value => `status-pill status-${escapeHtml(value || 'new')}`;
const createCode = prefix => `${prefix}-${new Date().toISOString().slice(2,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

function updateCartBadge(){ byId('cartBadge').textContent = Object.values(cart).reduce((sum, qty) => sum + qty, 0); }
function addToCart(id){ const product = products.find(p => p.id === id); if (!product) return; if (Number(product.stock ?? 999999) <= 0) return showToast('Maaf, menu ini sedang habis.'); cart[id] = (cart[id] || 0) + 1; updateCartBadge(); showToast(`${product.name} masuk keranjang.`); }
function changeCartQty(id, delta){ cart[id] = (cart[id] || 0) + delta; if (cart[id] <= 0) delete cart[id]; updateCartBadge(); renderCart(); }
function cartEntries(){ return Object.entries(cart).map(([id, qty]) => ({product:products.find(p => p.id === id), qty})).filter(x => x.product); }
function cartTotal(){ return cartEntries().reduce((sum, row) => sum + Number(row.product.salePrice || 0) * row.qty, 0); }
function renderCart(){
 const rows = cartEntries(), host = byId('cartLines');
 if (!rows.length) host.innerHTML = '<div class="cart-empty">Keranjang masih kosong 🍱<br>Pilih menu dan jumlah box yang kamu butuhkan.</div>';
 else host.innerHTML = rows.map(({product:p,qty}) => `<div class="cart-line"><div><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.sellerName || 'Mitra BoxKita')} · ${money(p.salePrice)}/box</small><small>${escapeHtml(stockLabel(p))}</small></div><div class="cart-line-end"><b>${money(Number(p.salePrice)*qty)}</b><div class="qty-control"><button type="button" data-cart-minus="${escapeHtml(p.id)}" aria-label="Kurangi">−</button><span>${qty}</span><button type="button" data-cart-plus="${escapeHtml(p.id)}" aria-label="Tambah">+</button></div></div></div>`).join('');
 byId('cartTotal').textContent = money(cartTotal());
 const payment = PAYMENT_INFO; const paymentConfigured = payment.bankName && payment.accountName && payment.accountNo && !/Atur /i.test(payment.bankName) && !/Atur /i.test(payment.accountName) && !/Atur /i.test(payment.accountNo);
 byId('checkoutPaymentInfo').innerHTML = paymentConfigured ? `<b>Transfer ke rekening pengelola</b><span>${escapeHtml(payment.bankName)} · ${escapeHtml(payment.accountNo)}<br>Atas nama: ${escapeHtml(payment.accountName)}<br>Transfer setelah pengelola mengonfirmasi pesanan dan total akhir.</span>` : `<b>Metode pembayaran</b><span>Transfer ke rekening pengelola setelah pesanan dikonfirmasi. Rekening tujuan akan disampaikan setelah detail pembayaran resmi diatur. Jangan mentransfer sebelum menerima konfirmasi.</span>`;
}
function isFavorite(id){try{return JSON.parse(localStorage.getItem('boxkita_favorites')||'[]').includes(id)}catch(_){return false}}
function openProductDetail(productId){
 const p=products.find(item=>item.id===productId);if(!p)return;
 const isBarokah=p.category==='Jumat Barokah'||/jumat\s+barokah/i.test(p.name||'');
 const isBoxKita=p.category==='Box Kita'||/boxkita.*(kue|snack)|snack box/i.test(p.name||'');
 const body=byId('productDetailBody');
 body.innerHTML=`<div class="detail-product-visual ${isBarokah?'detail-barokah':''} ${isBoxKita?'detail-boxkita':''}">${p.imageUrl?`<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" onerror="this.remove()">`:`<span>${escapeHtml(p.emoji||'🍱')}</span>`}</div><div class="detail-product-meta"><span class="detail-category">${escapeHtml(p.category||'Nasi Box')}</span><span class="detail-stock ${Number(p.stock??999999)<=0?'out-of-stock':''}">${escapeHtml(stockLabel(p))}</span></div><h3 class="detail-product-name">${escapeHtml(p.name)}</h3><p class="detail-product-description">${escapeHtml(p.description||'Menu pilihan mitra BoxKita.')}</p><div class="detail-product-seller">Dapur mitra: <b>${escapeHtml(p.sellerName||'Mitra BoxKita')}</b></div><div class="detail-product-area">📍 Area layanan: ${escapeHtml(normalizeArea(p.area||'Semua wilayah'))}</div><div class="detail-product-price">${money(p.salePrice)} <small>/ box</small></div><div class="detail-product-actions"><button type="button" class="btn btn-primary" data-detail-add="${escapeHtml(p.id)}" ${Number(p.stock??999999)<=0?'disabled':''}>+ Tambah ke keranjang</button><button type="button" class="btn btn-ghost" data-detail-favorite="${escapeHtml(p.id)}">${isFavorite(p.id)?'♥ Tersimpan':'♡ Favorit'}</button></div><small class="detail-note">Harga dan ketersediaan akan dikonfirmasi pengelola sebelum pesanan diproses.</small>`;
 openModal('productDetailModal');
}
byId('productDetailBody').addEventListener('click',e=>{
 const add=e.target.closest('[data-detail-add]');if(add){addToCart(add.dataset.detailAdd);closeModal('productDetailModal');return;}
 const fav=e.target.closest('[data-detail-favorite]');if(fav){const id=fav.dataset.detailFavorite;let ids=[];try{ids=JSON.parse(localStorage.getItem('boxkita_favorites')||'[]')}catch(_){}ids=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];localStorage.setItem('boxkita_favorites',JSON.stringify(ids));fav.textContent=ids.includes(id)?'♥ Tersimpan':'♡ Favorit';showToast(ids.includes(id)?'Menu ditambahkan ke favorit.':'Menu dihapus dari favorit.');renderProducts();}
});
function renderProducts(){
 const queryText = (byId('searchInput').value || '').toLocaleLowerCase('id-ID'), category = selectedCategory || byId('categoryFilter').value, sort = byId('sortFilter').value;
 let rows = products.filter(p => p.status === 'active' && (category === 'all' || p.category === category) && `${p.name} ${p.description||''} ${p.sellerName||''} ${p.area||''}`.toLocaleLowerCase('id-ID').includes(queryText));
 if (sort === 'price-low') rows.sort((a,b) => a.salePrice-b.salePrice); else if (sort === 'price-high') rows.sort((a,b) => b.salePrice-a.salePrice); else rows.sort((a,b) => Number(a.sort ?? 999)-Number(b.sort ?? 999));
 const host = byId('productGrid');
 if (!rows.length){ host.innerHTML = '<div class="empty-state">Menu belum ditemukan. Coba kategori atau kata kunci lain.</div>'; return; }
 const imgClasses = ['','img-green','img-rose','img-purple'];
 host.innerHTML = rows.map((p,i) => { const isBarokah = p.category === 'Jumat Barokah' || /jumat\s+barokah/i.test(p.name || ''); const isBoxKita = p.category === 'Box Kita' || /boxkita.*(kue|snack)|snack box/i.test(p.name || ''); return `<article class="product-card ${isBarokah ? 'product-card-barokah' : ''} ${isBoxKita ? 'product-card-boxkita' : ''}" data-product-card="${escapeHtml(p.id)}" tabindex="0" aria-label="Lihat detail ${escapeHtml(p.name)}"><div class="product-image ${imgClasses[i%4]} ${isBarokah ? 'product-image-barokah' : ''} ${isBoxKita ? 'product-image-boxkita' : ''}">${p.imageUrl ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.remove()">` : `<span class="product-emoji">${escapeHtml(p.emoji || '🍱')}</span>`}<span class="product-tag ${isBarokah ? 'product-tag-barokah' : ''} ${isBoxKita ? 'product-tag-boxkita' : ''}">${escapeHtml(isBarokah ? 'MENU SPESIAL' : (isBoxKita ? 'BOX KUE' : (p.category || 'Nasi Box')))}</span>${isBarokah ? '<span class="barokah-mini-badge">Jumat Barokah</span>' : ''}${isBoxKita ? '<span class="boxkita-mini-badge">Aneka Kue</span>' : ''}<button class="favorite-btn ${isFavorite(p.id)?'is-favorite':''}" type="button" title="Simpan menu" data-favorite="${escapeHtml(p.id)}">${isFavorite(p.id)?'♥':'♡'}</button></div><div class="product-content"><div class="seller-line"><span class="seller-dot"></span>${escapeHtml(p.sellerName || 'Mitra BoxKita')}</div><h3>${escapeHtml(p.name)}</h3><div class="product-description">${escapeHtml(p.description || 'Menu pilihan mitra.')}</div><div class="product-view-hint">Ketuk untuk detail ↗</div><div class="product-bottom"><div class="product-price">${money(p.salePrice)}<small>per box · ${escapeHtml(stockLabel(p))}</small></div><button class="add-cart" type="button" aria-label="Tambah ${escapeHtml(p.name)}" data-add="${escapeHtml(p.id)}" ${Number(p.stock ?? 999999)<=0?'disabled':''}>+</button></div></div></article>`; }).join('');
}
function renderPartnerShowcase(){
 const active = partners.filter(p=>p.status==='active').slice(0,6), host = byId('partnerShowcase');
 if (!active.length) { host.innerHTML = '<div class="empty-state">Mitra akan ditampilkan di sini setelah disetujui pengelola.</div>'; return; }
 const emojis=['👩‍🍳','🍳','🥗','🥘','👨‍🍳','🍲'], colors=['avatar-orange','avatar-green','avatar-purple'];
 host.innerHTML = active.slice(0,3).map((p,i)=>`<article class="partner-card"><div class="partner-avatar ${colors[i%3]}">${emojis[i%emojis.length]}</div><div><b>${escapeHtml(p.name)}</b><span>${escapeHtml(p.specialty||'Layanan nasi box')} · ${escapeHtml(p.area||'Semua wilayah')}</span></div><small>Mitra BoxKita</small></article>`).join('');
}
async function loadCatalog(){
 if (IS_DEMO) {
   const sim=getSimulationState();
   // Public catalog deliberately omits costPrice; the internal simulation keeps it in sim.products.
   products = sim.products.map(({costPrice, ...p})=>({...p}));
   partners = sim.partners.map(p=>({...p}));
   byId('catalogFootnote').textContent='MODE SIMULASI · Harga dan stok contoh tersimpan di browser ini. Tidak ada pembayaran sungguhan.';
   byId('simulationModeChip')?.removeAttribute('hidden');
 } else {
   try { const [catSnap, partSnap] = await Promise.all([getDocs(query(collection(db,'catalog'),where('status','==','active'))),getDocs(query(collection(db,'partnerDirectory'),where('status','==','active')))]); products = catSnap.docs.map(d=>({id:d.id,...d.data()})); if(!currentAdmin) partners = partSnap.docs.map(d=>({id:d.id,...d.data()})); }
   catch(error){console.error(error);products=[];partners=[];showToast('Menu belum dapat dimuat. Periksa koneksi dan konfigurasi Firebase.');}
 }
 renderProducts(); renderPartnerShowcase();
}

byId('productGrid').addEventListener('click', e=>{
 const add=e.target.closest('[data-add]');if(add){addToCart(add.dataset.add);return;}
 const fav=e.target.closest('[data-favorite]');if(fav){let ids=[];try{ids=JSON.parse(localStorage.getItem('boxkita_favorites')||'[]')}catch(_){}const id=fav.dataset.favorite;ids=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];localStorage.setItem('boxkita_favorites',JSON.stringify(ids));fav.classList.toggle('is-favorite',ids.includes(id));fav.textContent=ids.includes(id)?'♥':'♡';showToast(ids.includes(id)?'Menu ditambahkan ke favorit.':'Menu dihapus dari favorit.');return;}
 const card=e.target.closest('[data-product-card]');if(card)openProductDetail(card.dataset.productCard);
});
byId('productGrid').addEventListener('keydown',e=>{const card=e.target.closest('[data-product-card]');if(card&&(e.key==='Enter'||e.key===' ')){if(e.target!==card)return;e.preventDefault();openProductDetail(card.dataset.productCard);}});
byId('cartLines').addEventListener('click',e=>{const minus=e.target.closest('[data-cart-minus]'),plus=e.target.closest('[data-cart-plus]');if(minus)changeCartQty(minus.dataset.cartMinus,-1);if(plus)changeCartQty(plus.dataset.cartPlus,1);});
byId('searchInput').addEventListener('input',renderProducts);
byId('categoryFilter').addEventListener('change',e=>{selectedCategory=e.target.value;document.querySelectorAll('.category-chip').forEach(b=>b.classList.toggle('active',b.dataset.category===selectedCategory));renderProducts();});
byId('sortFilter').addEventListener('change',renderProducts);
byId('jumatBarokahBtn')?.addEventListener('click',()=>{selectedCategory='Jumat Barokah';byId('searchInput').value='';byId('sortFilter').value='featured';byId('categoryFilter').value=selectedCategory;document.querySelectorAll('.category-chip').forEach(b=>b.classList.toggle('active',b.dataset.category===selectedCategory));renderProducts();scrollToSiteSection('menu', false);});
byId('boxKitaBtn')?.addEventListener('click',()=>{selectedCategory='Box Kita';byId('searchInput').value='';byId('sortFilter').value='featured';byId('categoryFilter').value=selectedCategory;document.querySelectorAll('.category-chip').forEach(b=>b.classList.toggle('active',b.dataset.category===selectedCategory));renderProducts();scrollToSiteSection('menu', false);});
byId('categoryChips').addEventListener('click',e=>{const chip=e.target.closest('[data-category]');if(!chip)return;selectedCategory=chip.dataset.category;byId('categoryFilter').value=selectedCategory;document.querySelectorAll('.category-chip').forEach(b=>b.classList.toggle('active',b===chip));renderProducts();});
byId('cartOpenBtn').addEventListener('click',()=>{renderCart();openModal('cartModal');});
byId('accountOpenBtn').addEventListener('click',openAccountEntry); byId('footerAccountBtn').addEventListener('click',openAccountEntry);
byId('adminDashboardEntry').addEventListener('click',()=>{if(currentRole==='admin'&&currentProfile?.active===true)showAdmin();});
function openAccountEntry(){
 if(currentRole==='admin'&&currentProfile?.active===true)return showAdmin();
 if(currentRole==='customer'||currentRole==='partner'||currentRole==='partner_pending')return showRoleDashboard(currentRole);
 showAccountLoginPanel();openModal('accountModal');
}
function openAdminEntry(){
 if(IS_DEMO){currentAdmin={uid:'boxkita-demo-admin',email:'simulasi@boxkita.local',simulation:true};currentSessionUser=currentAdmin;currentProfile={role:'admin',active:true};currentRole='admin';setNavigationRole('admin');showAdmin();showToast('Dashboard simulasi aktif. Data tersimpan di browser ini.');return;}
 if(firebaseInitializationError||!auth){showToast('Firebase belum berhasil dimuat. Periksa koneksi dan konfigurasi Firebase, lalu muat ulang halaman.');return;}
 if(currentRole==='admin'&&currentProfile?.active===true&&currentAdmin){showAdmin();return;}
 showAdminLoginPanel();openModal('loginModal');
}
window.boxKitaAdminOpen = openAdminEntry;
byId('mobileAccountBtn').addEventListener('click',()=>{closeMobileNav();openAccountEntry();});
byId('mobileAdminDashboardEntry').addEventListener('click',()=>{closeMobileNav();if(currentRole==='admin'&&currentProfile?.active===true)showAdmin();});
document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeModal(btn.dataset.close)));
document.addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close)closeModal(close.dataset.close);});
document.querySelectorAll('.modal-backdrop').forEach(backdrop=>backdrop.addEventListener('click',e=>{if(e.target===backdrop)backdrop.classList.remove('show');}));
byId('mobileMenuBtn').addEventListener('click',()=>{const panel=byId('mobileNav');const open=panel.classList.contains('hidden');panel.classList.toggle('hidden',!open);byId('mobileMenuBtn').setAttribute('aria-expanded',String(open));byId('mobileMenuBtn').setAttribute('aria-label',open?'Tutup navigasi':'Buka navigasi');});
// Portal akun pelanggan/mitra tersedia pada navigasi mobile. Akses admin memakai jalur tersembunyi (?portal=admin).
byId('installBtn').addEventListener('click',installPWA); if(byId('footerInstallBtn'))byId('footerInstallBtn').addEventListener('click',e=>{e.preventDefault();installPWA();});
let deferredInstall = null;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;byId('installBtn').classList.remove('hidden');});
async function installPWA(){ if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;}else showToast('Di Chrome/Edge, gunakan ikon Install di address bar atau menu browser → Install aplikasi.'); }
byId('mobileInstallBtn').addEventListener('click',()=>{closeMobileNav();installPWA();});

byId('partnerApplicationForm').addEventListener('submit', async event=>{
 event.preventDefault(); const form=event.currentTarget, data={businessName:getVal(form,'businessName'),contactName:getVal(form,'contactName'),phone:getVal(form,'phone'),area:getVal(form,'area'),capacity:getVal(form,'capacity'),specialty:getVal(form,'specialty'),notes:getVal(form,'notes')};
 try { setBusy(true,'Mengirim pendaftaran mitra…'); if(!IS_DEMO){await addDoc(collection(db,'partnerApplications'),{...data,status:'pending',createdAt:serverTimestamp(),source:'website'});} else {const sim=getSimulationState();sim.applications.unshift({...data,id:simulationId('APP'),status:'pending',createdAt:localStamp()});persistSimulation();}
 form.reset(); form.elements.area.value=''; showToast(IS_DEMO?'Simulasi: pendaftaran tersimpan. Buka Pengelola → Mitra & Pendaftar untuk meninjaunya.':'Pendaftaran terkirim. Tim BoxKita akan meninjaunya.');
 } catch(error){console.error(error);showToast(error.message||'Pendaftaran belum berhasil dikirim.');} finally{setBusy(false);}
});

byId('checkoutForm').addEventListener('submit', async event=>{
 event.preventDefault(); const rows=cartEntries(); if(!rows.length)return showToast('Pilih menu terlebih dahulu.'); if(rows.length>10)return showToast('Maksimal 10 jenis menu berbeda dalam satu pesanan. Buat pesanan terpisah untuk menu lainnya.');
 const form=event.currentTarget, deliveryArea=getVal(form,'deliveryArea'), streetAddress=getVal(form,'address'), customer={name:getVal(form,'customerName'),phone:getVal(form,'customerPhone'),deliveryDate:getVal(form,'deliveryDate'),deliveryArea,address:`${deliveryArea ? deliveryArea+' — ' : ''}${streetAddress}`,notes:getVal(form,'notes')};
 const items=rows.map(row=>({productId:row.product.id,qty:row.qty}));
 try{
  setBusy(true,'Mencatat pesanan…'); let orderCode;
  if(IS_DEMO){
   const sim=getSimulationState();
   rows.forEach(r=>{const live=sim.products.find(p=>p.id===r.product.id);if(!live||live.status!=='active')throw new Error(`Menu ${r.product.name} sedang tidak tersedia.`);if(Number(live.stock??0)<r.qty)throw new Error(`Stok ${r.product.name} tidak mencukupi. Tersedia ${live.stock} box.`);});
   orderCode=createCode('BK');const snapItems=rows.map(r=>{const live=sim.products.find(p=>p.id===r.product.id);const unitPrice=Number(live.salePrice||0),costPrice=Number(live.costPrice||0),qty=Number(r.qty);return {productId:live.id,name:live.name,partnerId:live.partnerId,partnerName:live.partnerName||sim.partners.find(p=>p.id===live.partnerId)?.name||'Mitra BoxKita',qty,unitPrice,costPrice,lineTotal:unitPrice*qty,partnerCostTotal:costPrice*qty,platformMargin:(unitPrice-costPrice)*qty,settlementStatus:'pending'};});
   const total=snapItems.reduce((sum,i)=>sum+i.lineTotal,0),partnerCostTotal=snapItems.reduce((sum,i)=>sum+i.partnerCostTotal,0),platformMargin=total-partnerCostTotal;
   const order={id:orderCode,orderCode,customer:{...customer},deliveryDate:customer.deliveryDate,notes:customer.notes,items:snapItems,itemCount:snapItems.reduce((sum,i)=>sum+i.qty,0),total,partnerCostTotal,partnerPayoutTotal:partnerCostTotal,platformMargin,status:'new',paymentStatus:'unpaid',paymentReference:'',settlementStatus:'pending',stockReserved:true,stockRestored:false,createdAt:localStamp(),updatedAt:localStamp(),source:'simulation'};
   sim.orders.unshift(order);for(const r of rows){const item=sim.products.find(p=>p.id===r.product.id);item.stock=Number(item.stock||0)-r.qty;item.updatedAt=localStamp();}persistSimulation();
  }
  else {
   orderCode=createCode('BK');
   // Spark/free-tier mode: write a price-free order request directly to Firestore.
   // Public requests cannot choose prices, partner costs, margins, or stock values.
   const orderRequest={
    orderCode,
    customer:{name:customer.name,phone:customer.phone,deliveryDate:customer.deliveryDate,deliveryArea:customer.deliveryArea,address:customer.address,notes:customer.notes},
    items:items.map(item=>({productId:String(item.productId),qty:Number(item.qty)})),
    status:'new',paymentStatus:'unpaid',paymentReference:'',settlementStatus:'pending',
    stockReserved:false,stockRestored:false,source:'public-web',
    createdAt:serverTimestamp(),updatedAt:serverTimestamp()
   };
   if(currentRole==='customer'&&auth?.currentUser?.uid===currentSessionUser?.uid)orderRequest.customerUid=currentSessionUser.uid;
   const orderRef=doc(collection(db,'orders'));const orderBatch=writeBatch(db);orderBatch.set(orderRef,orderRequest);
   if(orderRequest.customerUid){
    const customerViewItems=rows.map(r=>({productId:String(r.product.id),name:String(r.product.name||'Menu BoxKita'),qty:Number(r.qty),unitPrice:Number(r.product.salePrice||0),lineTotal:Number(r.product.salePrice||0)*Number(r.qty)}));
    orderBatch.set(doc(db,'customerOrderViews',orderRequest.customerUid,'orders',orderRef.id),{
     orderId:orderRef.id,orderCode,customerUid:orderRequest.customerUid,
     customer:{name:customer.name,phone:customer.phone,deliveryDate:customer.deliveryDate,deliveryArea:customer.deliveryArea,address:customer.address,notes:customer.notes},
     items:customerViewItems,itemCount:customerViewItems.reduce((n,i)=>n+i.qty,0),total:customerViewItems.reduce((n,i)=>n+i.lineTotal,0),
     status:'new',paymentStatus:'unpaid',deliveryDate:customer.deliveryDate,createdAt:serverTimestamp(),updatedAt:serverTimestamp()
    });
   }
   await orderBatch.commit();
  }
  lastOrderMessage=`Halo BoxKita, saya ingin konfirmasi pesanan ${orderCode}. Nama: ${customer.name}; WA: ${customer.phone}; Wilayah: ${customer.deliveryArea}; Tanggal: ${customer.deliveryDate}; Alamat: ${customer.address}. Detail pesanan: ${rows.map(r=>`${r.product.name} x ${r.qty}`).join('; ')}. Total sementara ${money(cartTotal())}. Mohon konfirmasi stok, rekening resmi, dan ongkir.`;
  closeModal('cartModal'); byId('resultTitle').textContent='Pesanan berhasil dicatat';byId('resultText').textContent=IS_DEMO?'MODE SIMULASI: pesanan tersimpan di browser ini dan tampil di dashboard pengelola simulasi. Tidak ada pembayaran sungguhan.':'Pesanan kamu sudah tercatat. Tunggu konfirmasi ketersediaan, total akhir, dan detail pembayaran dari pengelola.';byId('resultCode').textContent=orderCode;openModal('resultModal');byId('resultWhatsAppBtn').textContent=isConfiguredWA()?'Kirim detail ke WhatsApp ↗':'Atur nomor WhatsApp pengelola';
  cart={};updateCartBadge();renderCart();form.reset();await loadCatalog();
 }catch(error){console.error(error);showToast(error?.message||'Pesanan belum berhasil dibuat. Silakan coba lagi.');}finally{setBusy(false);}
});
byId('resultWhatsAppBtn').addEventListener('click',()=>{if(!isConfiguredWA()){showToast('Ganti WA_ADMIN di public/app.js dengan nomor pengelola.');return;}window.open(`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(lastOrderMessage)}`,'_blank','noopener');});

// Role-based sessions: menu pengelola is only exposed after Firestore confirms role=admin and active=true.
async function verifyAdmin(user){
 if(!user||IS_DEMO)return false;
 const profile=await getDoc(doc(db,'users',user.uid));
 const data=profile.exists()?profile.data():null;
 return !!data&&data.role==='admin'&&data.active===true;
}
function setNavigationRole(role){
 const admin=role==='admin'&&currentProfile?.role==='admin'&&currentProfile?.active===true;
 byId('adminDashboardEntry').classList.toggle('hidden',!admin);
 byId('mobileAdminDashboardEntry').classList.toggle('hidden',!admin);
 const accountBtn=byId('accountOpenBtn');
 accountBtn.textContent=role==='customer'?'Dashboard Pelanggan':role==='partner'?'Dashboard Mitra':role==='partner_pending'?'Status Mitra':role==='admin'?'Akun Admin':'Akun / Login';
 byId('mobileAccountBtn').textContent=role==='customer'?'👤 Dashboard Pelanggan':role==='partner'?'🍱 Dashboard Mitra':role==='partner_pending'?'⏳ Status Pendaftaran Mitra':'👤 Akun Pelanggan / Mitra';
}
function hideAllDashboards(){
 byId('adminApp').classList.add('hidden');byId('roleDashboard').classList.add('hidden');
 byId('publicApp').classList.remove('hidden');document.querySelector('.topbar').classList.remove('hidden');document.querySelector('.footer').classList.remove('hidden');
 document.querySelector('.admin-sidebar').classList.remove('open');
}
function showAccountLoginPanel(){
 byId('accountLoginForm').classList.remove('hidden');byId('customerRegisterForm').classList.add('hidden');byId('partnerRegisterForm').classList.add('hidden');
}
byId('showCustomerRegister').addEventListener('click',()=>{byId('accountLoginForm').classList.add('hidden');byId('customerRegisterForm').classList.remove('hidden');byId('partnerRegisterForm').classList.add('hidden');});
byId('showPartnerRegister').addEventListener('click',()=>{byId('accountLoginForm').classList.add('hidden');byId('customerRegisterForm').classList.add('hidden');byId('partnerRegisterForm').classList.remove('hidden');});
byId('customerBackToLogin').addEventListener('click',showAccountLoginPanel);byId('partnerBackToLogin').addEventListener('click',showAccountLoginPanel);
async function readUserProfile(uid){
 for(let attempt=0;attempt<4;attempt++){
  const snap=await getDoc(doc(db,'users',uid));if(snap.exists())return snap.data();
  if(attempt<3)await new Promise(resolve=>setTimeout(resolve,350));
 }
 return null;
}
async function handleAuthenticatedUser(user){
 const sequence=++authRouteSequence;
 if(!user){currentAdmin=null;currentSessionUser=null;currentProfile=null;currentRole=null;setNavigationRole(null);hideAllDashboards();return;}
 try{
  const profile=await readUserProfile(user.uid);if(sequence!==authRouteSequence)return;
  if(!profile){currentAdmin=null;currentSessionUser=user;currentProfile=null;currentRole='unprovisioned';setNavigationRole(null);hideAllDashboards();closeModal('accountModal');showToast('Akun login ditemukan, tetapi profil BoxKita belum tersimpan. Coba login ulang atau hubungi pengelola.');return;}
  currentSessionUser=user;currentProfile=profile;currentRole=String(profile.role||'');
  if(profile.role==='admin'&&profile.active===true){currentAdmin=user;setNavigationRole('admin');closeModal('loginModal');closeModal('accountModal');showAdmin();return;}
  currentAdmin=null;setNavigationRole(currentRole);
  if(profile.role==='customer'&&profile.active===true){closeModal('accountModal');showRoleDashboard('customer');return;}
  if(profile.role==='partner'&&profile.active===true){closeModal('accountModal');showRoleDashboard('partner');return;}
  if(profile.role==='partner_pending'||profile.role==='partner'&&profile.active!==true){currentRole='partner_pending';setNavigationRole('partner_pending');closeModal('accountModal');showRoleDashboard('partner_pending');return;}
  hideAllDashboards();showToast('Akun belum memiliki akses aktif. Hubungi pengelola BoxKita.');
 }catch(error){console.error('Gagal membaca role akun:',error);if(sequence===authRouteSequence){hideAllDashboards();showToast('Akses akun belum dapat diverifikasi. Periksa koneksi dan Firestore Rules.');}}
}
if(!IS_DEMO&&auth&&onAuthStateChanged){onAuthStateChanged(auth,handleAuthenticatedUser);}

// Customer and partner registration uses Firebase Authentication plus a self-owned, role-limited profile.
byId('accountLoginForm').addEventListener('submit',async event=>{
 event.preventDefault();if(IS_DEMO||firebaseInitializationError||!auth)return showToast('Firebase belum tersedia. Coba buka website yang sudah dipublikasikan melalui HTTPS.');
 const form=event.currentTarget;try{setBusy(true,'Memverifikasi akun…');await signInWithEmailAndPassword(auth,getVal(form,'email'),getVal(form,'password'));form.reset();}
 catch(error){console.error(error);showToast(error?.code==='auth/user-not-found'||error?.code==='auth/invalid-credential'?'Email atau password salah.':error?.message||'Login gagal.');}finally{setBusy(false);}
});
async function createRoleAccount(email,password,profile,partnerApplication=null){
 const credential=await createUserWithEmailAndPassword(auth,email,password);const uid=credential.user.uid;
 await setDoc(doc(db,'users',uid),{...profile,email,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
 if(partnerApplication){await addDoc(collection(db,'partnerApplications'),{...partnerApplication,uid,status:'pending',createdAt:serverTimestamp(),source:'website'});}
 await handleAuthenticatedUser(credential.user);
 return uid;
}
byId('customerRegisterForm').addEventListener('submit',async event=>{
 event.preventDefault();if(IS_DEMO||firebaseInitializationError||!auth)return showToast('Firebase belum tersedia.');
 const form=event.currentTarget,email=getVal(form,'email').trim().toLowerCase(),password=getVal(form,'password'),confirmation=getVal(form,'confirmPassword');
 if(password.length<8)return showToast('Gunakan password minimal 8 karakter.');if(password!==confirmation)return showToast('Konfirmasi password belum sama.');
 try{setBusy(true,'Membuat akun pelanggan…');await createRoleAccount(email,password,{role:'customer',active:true,displayName:getVal(form,'displayName'),phone:getVal(form,'phone')});form.reset();showToast('Akun pelanggan berhasil dibuat.');}
 catch(error){console.error(error);showToast(error?.code==='auth/email-already-in-use'?'Email sudah terdaftar. Silakan login.':error?.message||'Pendaftaran pelanggan gagal. Periksa Firebase Rules.');}finally{setBusy(false);}
});
byId('partnerRegisterForm').addEventListener('submit',async event=>{
 event.preventDefault();if(IS_DEMO||firebaseInitializationError||!auth)return showToast('Firebase belum tersedia.');
 const form=event.currentTarget,email=getVal(form,'email').trim().toLowerCase(),password=getVal(form,'password'),confirmation=getVal(form,'confirmPassword');
 if(password.length<8)return showToast('Gunakan password minimal 8 karakter.');if(password!==confirmation)return showToast('Konfirmasi password belum sama.');
 const application={businessName:getVal(form,'businessName'),contactName:getVal(form,'contactName'),phone:getVal(form,'phone'),area:getVal(form,'area'),capacity:getVal(form,'capacity'),specialty:getVal(form,'specialty'),notes:''};
 try{setBusy(true,'Membuat akun dan mengirim pengajuan mitra…');await createRoleAccount(email,password,{role:'partner_pending',active:false,displayName:application.contactName,phone:application.phone,businessName:application.businessName},application);form.reset();showToast('Akun mitra dibuat. Status menunggu persetujuan pengelola.');}
 catch(error){console.error(error);showToast(error?.code==='auth/email-already-in-use'?'Email sudah terdaftar. Coba login.':error?.message||'Pendaftaran mitra gagal. Periksa Rules Firestore.');}finally{setBusy(false);}
});

byId('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(IS_DEMO){currentAdmin={uid:'boxkita-demo-admin',email:'simulasi@boxkita.local',simulation:true};currentSessionUser=currentAdmin;currentProfile={role:'admin',active:true};currentRole='admin';setNavigationRole('admin');closeModal('loginModal');showAdmin();return showToast('Dashboard simulasi dibuka.');}if(firebaseInitializationError||!auth){showToast('Firebase SDK gagal dimuat. Periksa koneksi dan muat ulang halaman.');return;}const form=e.currentTarget;try{setBusy(true,'Memverifikasi akun…');await signInWithEmailAndPassword(auth,getVal(form,'email'),getVal(form,'password'));form.reset();}catch(error){console.error(error);showToast('Login gagal. Periksa email, password, dan pengaturan Firebase Authentication.');}finally{setBusy(false);}});
function showAdminLoginPanel(){
  byId('loginForm').classList.remove('hidden');
  byId('toggleAdminRegister').classList.remove('hidden');
  byId('adminRegisterPanel').classList.add('hidden');
  byId('adminRegisterForm').classList.remove('hidden');
  byId('adminRegisterResult').classList.add('hidden');
}
byId('toggleAdminRegister').addEventListener('click',()=>{
  byId('loginForm').classList.add('hidden');
  byId('toggleAdminRegister').classList.add('hidden');
  byId('adminRegisterPanel').classList.remove('hidden');
});
byId('backToAdminLogin').addEventListener('click',showAdminLoginPanel);
async function createAdminAuthAccount(email,password){
  if(!getApps||!deleteApp||!createUserWithEmailAndPassword||!setPersistence||!inMemoryPersistence)throw new Error('Fungsi registrasi Firebase belum tersedia. Perbarui halaman dan periksa koneksi.');
  let registrationApp=null;
  try{
    registrationApp=getApps().find(existing=>existing.name==='boxkita-admin-registration')||initializeApp(firebaseConfig,'boxkita-admin-registration');
    const temporaryAuth=getAuth(registrationApp);
    await setPersistence(temporaryAuth,inMemoryPersistence);
    const credential=await createUserWithEmailAndPassword(temporaryAuth,email,password);
    const uid=credential.user.uid;
    await signOut(temporaryAuth);
    return uid;
  }finally{
    if(registrationApp){try{await deleteApp(registrationApp);}catch(cleanupError){console.warn('Temporary registration app cleanup:',cleanupError);}}
  }
}
byId('adminRegisterForm').addEventListener('submit',async event=>{
  event.preventDefault();
  if(IS_DEMO)return showToast('Firebase belum dikonfigurasi aktif. Pada mode simulasi, klik Pengelola untuk masuk tanpa akun.');
  if(firebaseInitializationError||!auth)return showToast('Firebase belum berhasil dimuat. Periksa koneksi, lalu muat ulang.');
  const form=event.currentTarget,email=getVal(form,'email').trim(),password=getVal(form,'password'),confirmation=getVal(form,'confirmPassword');
  if(password.length<8)return showToast('Gunakan password minimal 8 karakter.');
  if(password!==confirmation)return showToast('Konfirmasi password belum sama.');
  try{
    setBusy(true,'Mendaftarkan akun Firebase…');
    const uid=await createAdminAuthAccount(email,password);
    byId('adminRegisterForm').classList.add('hidden');
    byId('adminRegisterResult').classList.remove('hidden');
    byId('adminRegisterResultMessage').textContent=`Akun login berhasil dibuat untuk ${email}. Satu langkah keamanan lagi diperlukan sebelum akun ini bisa menjadi pengelola.`;
    byId('adminRegisterUid').textContent=uid;
    byId('adminRegisterNextSteps').classList.remove('hidden');
    byId('toggleAdminRegister').classList.add('hidden');
    showToast('Akun login terdaftar. Selesaikan aktivasi role admin di Firestore.');
    form.reset();
  }catch(error){
    console.error('Admin account registration failed:',error);
    const message=error?.code==='auth/email-already-in-use'?'Email tersebut sudah terdaftar. Gunakan login atau email lain.':error?.code==='auth/weak-password'?'Password terlalu lemah. Gunakan minimal 8 karakter.':error?.code==='auth/operation-not-allowed'?'Aktifkan Email/Password di Firebase Authentication → Sign-in method.':error?.code==='auth/invalid-email'?'Format email tidak valid.':(error?.message||'Akun belum berhasil dibuat. Periksa Firebase Authentication.');
    showToast(message);
  }finally{setBusy(false);}
});
byId('copyAdminUidBtn').addEventListener('click',async()=>{
  const uid=byId('adminRegisterUid').textContent.trim();
  try{await navigator.clipboard.writeText(uid);showToast('UID admin berhasil disalin.');}
  catch(error){showToast('Salin UID secara manual dari kotak di atas.');}
});
byId('returnAdminLoginAfterRegister').addEventListener('click',showAdminLoginPanel);

byId('logoutBtn').addEventListener('click',async()=>{if(auth)await signOut(auth);currentAdmin=null;currentSessionUser=null;currentProfile=null;currentRole=null;setNavigationRole(null);hideAdmin();showToast('Kamu sudah keluar dari dashboard.');});
byId('backToStore').addEventListener('click',hideAdmin);
byId('roleBackToStore').addEventListener('click',hideRoleDashboard);
byId('roleLogoutBtn').addEventListener('click',async()=>{if(auth)await signOut(auth);currentSessionUser=null;currentProfile=null;currentRole=null;currentAdmin=null;setNavigationRole(null);hideRoleDashboard();showToast('Kamu sudah keluar dari akun.');});
byId('roleBrandHome').addEventListener('click',e=>{e.preventDefault();hideRoleDashboard();window.location.hash='home';});
byId('roleDashboardNav').addEventListener('click',e=>{const b=e.target.closest('[data-role-view]');if(!b)return;roleDashboardView=b.dataset.roleView;renderRoleDashboard();});
byId('adminMobileMenuBtn').addEventListener('click',()=>document.querySelector('.admin-sidebar').classList.toggle('open'));
document.querySelectorAll('.admin-nav[data-view]').forEach(button=>button.addEventListener('click',()=>{activeView=button.dataset.view;document.querySelectorAll('.admin-nav[data-view]').forEach(b=>b.classList.toggle('active',b===button));document.querySelector('.admin-sidebar').classList.remove('open');renderAdminView();}));
byId('refreshAdminBtn').addEventListener('click',refreshAdminData);
const resetSimBtn=byId('resetSimulationBtn');
if(resetSimBtn){if(!IS_DEMO)resetSimBtn.classList.add('hidden');resetSimBtn.addEventListener('click',async()=>{if(!IS_DEMO)return showToast('Reset simulasi hanya tersedia saat Firebase belum dikonfigurasi.');if(!confirm('Reset seluruh data simulasi pada browser ini? Pesanan, pendaftaran, dan perubahan menu akan dihapus lalu data contoh dipulihkan.'))return;localStorage.removeItem(SIM_STORAGE_KEY);localStorage.removeItem(LEGACY_SIM_STORAGE_KEY);localStorage.removeItem(OLDER_SIM_STORAGE_KEY);simulationState=null;cart={};updateCartBadge();await loadCatalog();if(currentAdmin){activeView='overview';document.querySelectorAll('.admin-nav[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='overview'));await refreshAdminData();}showToast('Data simulasi direset ke kondisi awal.');});}

function showAdmin(){
 if(!IS_DEMO&&!(currentAdmin&&currentProfile?.role==='admin'&&currentProfile?.active===true)){hideAdmin();showToast('Dashboard pengelola hanya tersedia untuk akun admin yang aktif.');return;}
 byId('roleDashboard').classList.add('hidden');byId('publicApp').classList.add('hidden');document.querySelector('.topbar').classList.add('hidden');document.querySelector('.footer').classList.add('hidden');byId('adminApp').classList.remove('hidden');byId('adminEmail').textContent=currentAdmin?.email||'Pengelola';refreshAdminData();window.scrollTo({top:0,behavior:'instant'});
}
function hideAdmin(){byId('adminApp').classList.add('hidden');byId('roleDashboard').classList.add('hidden');byId('publicApp').classList.remove('hidden');document.querySelector('.topbar').classList.remove('hidden');document.querySelector('.footer').classList.remove('hidden');document.querySelector('.admin-sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'instant'});}
function hideRoleDashboard(){byId('roleDashboard').classList.add('hidden');byId('adminApp').classList.add('hidden');byId('publicApp').classList.remove('hidden');document.querySelector('.topbar').classList.remove('hidden');document.querySelector('.footer').classList.remove('hidden');window.scrollTo({top:0,behavior:'instant'});}
function showRoleDashboard(role){
 if(!currentSessionUser||!currentProfile)return openAccountEntry();
 roleDashboardView='overview';
 if(role==='admin')return showAdmin();
 byId('adminApp').classList.add('hidden');byId('publicApp').classList.add('hidden');document.querySelector('.topbar').classList.add('hidden');document.querySelector('.footer').classList.add('hidden');byId('roleDashboard').classList.remove('hidden');
 const isPartner=role==='partner'||role==='partner_pending';
 byId('roleDashboardName').textContent=role==='customer'?'Dashboard Pelanggan':role==='partner'?'Dashboard Mitra':'Status Pendaftaran Mitra';
 byId('roleDashboardEmail').textContent=currentSessionUser.email||'';byId('roleSidebarName').textContent=currentProfile.displayName||currentProfile.businessName||currentSessionUser.email||'Akun BoxKita';
 byId('roleSidebarRole').textContent=role==='customer'?'Pelanggan':role==='partner'?'Mitra aktif':'Mitra · menunggu persetujuan';byId('roleAvatar').textContent=isPartner?'🍱':'👤';byId('roleBrandSub').textContent=isPartner?'DASHBOARD MITRA':'DASHBOARD PELANGGAN';
 const nav=role==='customer'?[['overview','Ringkasan','▦'],['orders','Pesanan Saya','🧾'],['favorites','Favorit Saya','♡'],['profile','Profil Saya','👤']]:role==='partner'?[['overview','Ringkasan','▦'],['orders','Pesanan Mitra','🧾'],['products','Menu Saya','🍱'],['profile','Profil Usaha','🏪']]:[['overview','Status Pengajuan','⏳'],['profile','Data Pendaftaran','🏪']];
 byId('roleDashboardNav').innerHTML=nav.map(([id,label,icon])=>`<button class="role-nav-item ${id===roleDashboardView?'active':''}" data-role-view="${id}" type="button"><span>${icon}</span>${label}</button>`).join('');
 renderRoleDashboard();window.scrollTo({top:0,behavior:'instant'});
}
function roleDashboardHeader(title,subtitle,action=''){return `<div class="role-page-title"><div><span>BOXKITA · AREA AKUN</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>${action}</div>`;}
function roleOrderCard(order,partnerMode=false){
 const items=Array.isArray(order.items)?order.items:[];const details=items.map(i=>`${escapeHtml(i.name||i.productId||'Menu')} × ${Number(i.qty||0)}`).join(' · ')||'Menunggu rincian dan konfirmasi pengelola';
 return `<article class="role-order-card"><div class="role-order-card-head"><div><span class="role-order-code">${escapeHtml(order.orderCode||order.id||'Pesanan')}</span><b>${money(partnerMode?(order.partnerCostTotal||0):(order.total||0))}</b><small>${partnerMode?'Nilai porsi mitra':'Total pesanan'}</small></div><span class="${statusClass(order.status)}">${escapeHtml(statusLabel(order.status))}</span></div><p>${details}</p><div class="role-order-meta"><span>📅 ${formatDate(order.deliveryDate||order.createdAt)}</span><span>📍 ${escapeHtml(order.customer?.deliveryArea||'Area akan dikonfirmasi')}</span><span>💳 ${escapeHtml(statusLabel(order.paymentStatus))}</span></div>${partnerMode&&order.customer?.address?`<div class="role-order-address"><b>Alamat pengantaran</b><span>${escapeHtml(order.customer.address)}</span><small>Kontak pemesan: ${escapeHtml(order.customer?.phone||'—')}</small></div>`:''}</article>`;
}
async function renderRoleDashboard(){
 const host=byId('roleDashboardContent');if(!currentSessionUser||!currentProfile){host.innerHTML='<p>Akun tidak aktif. Silakan login kembali.</p>';return;}
 const role=currentRole,view=roleDashboardView;
 byId('roleDashboardNav').querySelectorAll('[data-role-view]').forEach(b=>b.classList.toggle('active',b.dataset.roleView===view));
 host.innerHTML='<div class="role-loading"><span class="spinner"></span>Memuat data akun…</div>';
 try{
  if(role==='partner_pending'){
   if(view==='profile')host.innerHTML=roleDashboardHeader('Data pendaftaran','Data yang kamu kirim saat mendaftar sebagai mitra.')+`<div class="role-panel"><dl class="role-profile-grid"><dt>Nama usaha</dt><dd>${escapeHtml(currentProfile.businessName||'—')}</dd><dt>Nama penanggung jawab</dt><dd>${escapeHtml(currentProfile.displayName||'—')}</dd><dt>Nomor WhatsApp</dt><dd>${escapeHtml(currentProfile.phone||'—')}</dd><dt>Email login</dt><dd>${escapeHtml(currentSessionUser.email||'—')}</dd></dl></div>`;
   else host.innerHTML=roleDashboardHeader('Pengajuan sedang ditinjau','Akun mitra belum aktif. Pengelola akan menghubungi kamu setelah meninjau kelengkapan usaha.')+`<div class="role-pending-card"><span>⏳</span><h2>Menunggu persetujuan BoxKita</h2><p>Setelah pengelola menyetujui pendaftaran, akun ini akan berubah menjadi Dashboard Mitra. Kamu belum dapat melihat pesanan atau data operasional mitra lain.</p><div class="role-status-chip">STATUS: MENUNGGU PERSETUJUAN</div><button type="button" class="btn btn-primary" data-refresh-role style="margin-top:16px">↻ Perbarui status</button></div>`;
   return;
  }
  if(role==='customer'){
   let customerOrders=[];if(!IS_DEMO&&db){const snap=await getDocs(collection(db,'customerOrderViews',currentSessionUser.uid,'orders'));customerOrders=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>dateMs(b.createdAt)-dateMs(a.createdAt));}
   const favorites=(()=>{try{return JSON.parse(localStorage.getItem('boxkita_favorites')||'[]')}catch(_){return [];}})();
   if(view==='overview')host.innerHTML=roleDashboardHeader(`Halo, ${currentProfile.displayName||'Pelanggan'} 👋`,'Pantau pesananmu dan kelola pilihan menu favorit.')+`<div class="role-kpi-grid"><div class="role-kpi"><span>🧾</span><b>${customerOrders.length}</b><small>Total pesanan akun</small></div><div class="role-kpi"><span>⏳</span><b>${customerOrders.filter(o=>!['delivered','cancelled'].includes(o.status)).length}</b><small>Masih diproses</small></div><div class="role-kpi"><span>♡</span><b>${favorites.length}</b><small>Menu favorit di perangkat ini</small></div></div><div class="role-panel"><div class="role-panel-head"><div><h2>Pesanan terbaru</h2><p>Pesanan yang dibuat saat kamu login dengan akun ini.</p></div><button class="btn btn-ghost btn-sm" data-role-view="orders">Lihat semua</button></div>${customerOrders.slice(0,3).map(o=>roleOrderCard(o)).join('')||'<div class="role-empty">Belum ada pesanan yang terkait dengan akun ini. Kembali ke toko dan pesan saat login untuk melihat statusnya di sini.</div>'}</div>`;
   else if(view==='orders')host.innerHTML=roleDashboardHeader('Pesanan Saya','Status dan riwayat pesanan yang tercatat atas akun ini.')+`<div class="role-order-list">${customerOrders.map(o=>roleOrderCard(o)).join('')||'<div class="role-empty">Belum ada riwayat pesanan.</div>'}</div>`;
   else if(view==='favorites'){
    const favProducts=products.filter(p=>favorites.includes(p.id));host.innerHTML=roleDashboardHeader('Menu Favorit','Daftar favorit disimpan pada browser/perangkat ini.')+`<div class="role-favorite-grid">${favProducts.map(p=>`<article class="role-favorite-card"><span>${escapeHtml(p.emoji||'🍱')}</span><div><b>${escapeHtml(p.name)}</b><small>${money(p.salePrice)} / box</small></div><button class="btn btn-ghost btn-sm" data-customer-fav-remove="${escapeHtml(p.id)}">Hapus</button></article>`).join('')||'<div class="role-empty">Belum ada menu favorit. Pilih simbol hati pada menu di toko.</div>'}</div>`;
   } else host.innerHTML=roleDashboardHeader('Profil Saya','Informasi akun pelanggan.')+`<div class="role-panel"><dl class="role-profile-grid"><dt>Nama</dt><dd>${escapeHtml(currentProfile.displayName||'—')}</dd><dt>Email</dt><dd>${escapeHtml(currentSessionUser.email||'—')}</dd><dt>WhatsApp</dt><dd>${escapeHtml(currentProfile.phone||'—')}</dd><dt>Status akun</dt><dd><span class="role-status-chip">AKTIF</span></dd></dl></div>`;
   return;
  }
  if(role==='partner'){
   const partnerId=currentProfile.partnerId;if(!partnerId)throw new Error('Akun mitra aktif belum terhubung ke data mitra. Hubungi pengelola.');
   const [productSnap,orderSnap,partnerSnap,settlementSnap]=await Promise.all([
    getDocs(query(collection(db,'catalog'),where('partnerId','==',partnerId))),
    getDocs(collection(db,'partnerOrderViews',partnerId,'orders')),
    getDoc(doc(db,'partners',partnerId)),
    getDocs(query(collection(db,'settlements'),where('partnerId','==',partnerId)))
   ]);
   const partner=partnerSnap.exists()?partnerSnap.data():{};const myProducts=productSnap.docs.map(d=>({id:d.id,...d.data()}));const myOrders=orderSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>dateMs(b.createdAt)-dateMs(a.createdAt));const mySettlements=settlementSnap.docs.map(d=>({id:d.id,...d.data()}));
   if(view==='overview')host.innerHTML=roleDashboardHeader(`Halo, ${partner.name||currentProfile.businessName||'Mitra'} 👋`,'Pantau pesanan yang sudah ditugaskan, menu, dan pencatatan pembayaran usahamu.')+`<div class="role-kpi-grid"><div class="role-kpi"><span>🍱</span><b>${myProducts.length}</b><small>Menu terdaftar</small></div><div class="role-kpi"><span>🧾</span><b>${myOrders.filter(o=>!['delivered','cancelled'].includes(o.status)).length}</b><small>Pesanan berjalan</small></div><div class="role-kpi"><span>💸</span><b>${money(mySettlements.reduce((s,x)=>s+Number(x.amount||0),0))}</b><small>Total pembayaran tercatat</small></div></div><div class="role-panel"><div class="role-panel-head"><div><h2>Pesanan terbaru</h2><p>Hanya pesanan yang telah ditugaskan ke mitra ini.</p></div><button class="btn btn-ghost btn-sm" data-role-view="orders">Lihat semua</button></div>${myOrders.slice(0,3).map(o=>roleOrderCard(o,true)).join('')||'<div class="role-empty">Belum ada pesanan yang ditugaskan kepada usaha ini.</div>'}</div>`;
   else if(view==='orders')host.innerHTML=roleDashboardHeader('Pesanan Mitra','Lihat detail produksi dan pengantaran yang sudah ditugaskan ke dapurmu.')+`<div class="role-order-list">${myOrders.map(o=>roleOrderCard(o,true)).join('')||'<div class="role-empty">Belum ada pesanan mitra.</div>'}</div>`;
   else if(view==='products')host.innerHTML=roleDashboardHeader('Menu Saya','Status dan stok menu milik usaha yang terhubung dengan akun ini.')+`<div class="role-favorite-grid">${myProducts.map(p=>`<article class="role-favorite-card"><span>${escapeHtml(p.emoji||'🍱')}</span><div><b>${escapeHtml(p.name||'Menu tanpa nama')}</b><small>Stok: ${Number(p.stock||0)} · Harga tayang: ${money(p.salePrice||0)} · ${escapeHtml(statusLabel(p.status))}</small></div></article>`).join('')||'<div class="role-empty">Menu usaha belum ditautkan. Minta pengelola menambahkan menu ke mitra yang benar.</div>'}</div>`;
   else host.innerHTML=roleDashboardHeader('Profil Usaha','Informasi usaha yang tercatat di BoxKita.')+`<div class="role-panel"><dl class="role-profile-grid"><dt>Nama usaha</dt><dd>${escapeHtml(partner.name||currentProfile.businessName||'—')}</dd><dt>Penanggung jawab</dt><dd>${escapeHtml(partner.contactName||currentProfile.displayName||'—')}</dd><dt>Area</dt><dd>${escapeHtml(partner.area||'—')}</dd><dt>Kapasitas</dt><dd>${escapeHtml(partner.capacity||'—')}</dd><dt>Spesialisasi</dt><dd>${escapeHtml(partner.specialty||'—')}</dd><dt>Email login</dt><dd>${escapeHtml(currentSessionUser.email||'—')}</dd><dt>Status mitra</dt><dd><span class="role-status-chip">${escapeHtml(statusLabel(partner.status||'active'))}</span></dd></dl></div>`;
   return;
  }
  host.innerHTML=roleDashboardHeader('Dashboard tidak tersedia','Peran akun belum dikenali. Hubungi pengelola BoxKita.');
 }catch(error){console.error('Role dashboard data load:',error);host.innerHTML=roleDashboardHeader('Data belum termuat','Periksa koneksi atau aturan akses Firestore.')+`<div class="role-empty">${escapeHtml(error.message||'Terjadi kesalahan saat memuat dashboard.')}</div>`;}
}
byId('roleDashboardContent').addEventListener('click',e=>{
 const refresh=e.target.closest('[data-refresh-role]');if(refresh&&currentSessionUser){handleAuthenticatedUser(currentSessionUser);return;}
 const nav=e.target.closest('[data-role-view]');if(nav){roleDashboardView=nav.dataset.roleView;renderRoleDashboard();return;}
 const remove=e.target.closest('[data-customer-fav-remove]');if(remove){let favorites=[];try{favorites=JSON.parse(localStorage.getItem('boxkita_favorites')||'[]')}catch(_){}favorites=favorites.filter(id=>id!==remove.dataset.customerFavRemove);localStorage.setItem('boxkita_favorites',JSON.stringify(favorites));renderRoleDashboard();showToast('Menu dihapus dari favorit.');}
});
async function refreshAdminData(){if(!currentAdmin)return;setBusy(true,'Memuat data dashboard…');try{
 if(IS_DEMO){const sim=getSimulationState();const resolvePartnerName=p=>p.partnerName||p.sellerName||sim.partners.find(x=>x.id===p.partnerId)?.name||'Mitra BoxKita';window.adminProducts=sim.products.map(p=>({...p,partnerName:resolvePartnerName(p)}));window.adminCatalogCache=sim.products.map(({costPrice,...p})=>({...p,sellerName:resolvePartnerName(p)}));products=sim.products.map(({costPrice,...p})=>({...p,sellerName:resolvePartnerName(p)}));partners=sim.partners.map(p=>({...p}));orders=sim.orders.map(o=>({...o}));applications=sim.applications.map(a=>({...a}));settlements=sim.settlements.map(s=>({...s}));byId('pendingOrderBadge').textContent=orders.filter(o=>['new','confirmed'].includes(o.status)).length;byId('pendingPartnerBadge').textContent=applications.filter(a=>a.status==='pending').length;byId('simulationBadge')?.removeAttribute('hidden');renderAdminView();return;}
 const names=['products','partners','orders','partnerApplications','settlements'];const snaps=await Promise.all(names.map(name=>getDocs(collection(db,name))));
 const map=Object.fromEntries(names.map((name,i)=>[name,snaps[i].docs.map(d=>({id:d.id,...d.data()}))]));
 const partnerNameById=Object.fromEntries(map.partners.map(p=>[p.id,p.name||'Mitra BoxKita']));
 const productById=Object.fromEntries(map.products.map(p=>[p.id,p]));
 window.adminProducts=map.products.map(p=>({...p,partnerName:p.partnerName||partnerNameById[p.partnerId]||'Mitra BoxKita'}));
 window.adminCatalogCache=[];products=products;partners=map.partners;applications=map.partnerApplications;settlements=map.settlements;
 try{const cat=await getDocs(collection(db,'catalog'));window.adminCatalogCache=cat.docs.map(d=>({id:d.id,...d.data()}));}catch(_){window.adminCatalogCache=[];}
 // New public orders contain product IDs and quantities only. Until confirmed, the
 // dashboard shows a provisional quote based on current admin-only product prices.
 // On confirmation, the current price/cost are frozen into the order transaction.
 orders=map.orders.map(o=>{
  const rawItems=Array.isArray(o.items)?o.items:[];
  const items=rawItems.map(i=>{
   const p=productById[i.productId]||{};const qty=Number(i.qty||0);
   const unitPrice=Number(i.unitPrice??p.salePrice??0);const costPrice=Number(i.costPrice??p.costPrice??0);
   const partnerId=i.partnerId||p.partnerId||'';const partnerName=i.partnerName||p.partnerName||partnerNameById[partnerId]||'Mitra BoxKita';
   return {...i,name:i.name||p.name||`Menu ${i.productId||''}`,partnerId,partnerName,qty,unitPrice,costPrice,lineTotal:Number(i.lineTotal??unitPrice*qty),partnerCostTotal:Number(i.partnerCostTotal??costPrice*qty),platformMargin:Number(i.platformMargin??(unitPrice-costPrice)*qty),settlementStatus:i.settlementStatus||'pending'};
  });
  const itemCount=Number(o.itemCount??items.reduce((n,i)=>n+Number(i.qty||0),0));
  const total=Number(o.total??items.reduce((n,i)=>n+Number(i.lineTotal||0),0));
  const partnerCostTotal=Number(o.partnerCostTotal??items.reduce((n,i)=>n+Number(i.partnerCostTotal||0),0));
  const platformMargin=Number(o.platformMargin??(total-partnerCostTotal));
  return {...o,items,itemCount,total,partnerCostTotal,partnerPayoutTotal:Number(o.partnerPayoutTotal??partnerCostTotal),platformMargin};
 });
 byId('pendingOrderBadge').textContent=orders.filter(o=>['new','confirmed'].includes(o.status)).length;byId('pendingPartnerBadge').textContent=applications.filter(a=>a.status==='pending').length;renderAdminView();
 }catch(error){console.error(error);byId('adminView').innerHTML=`<div class="admin-page-title"><div><h1>Dashboard belum termuat</h1><p>${escapeHtml(error.message||'Periksa rules Firestore, role admin, dan koneksi.')}</p></div></div>`;}finally{setBusy(false);}}
function adminPageHeader(title,subtitle,actionLabel='',actionId=''){return `<div class="admin-page-title"><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>${actionLabel?`<button class="btn btn-primary" id="${actionId}">＋ ${escapeHtml(actionLabel)}</button>`:''}</div>`;}
function renderAdminView(){const host=byId('adminView');byId('adminPageName').textContent=({overview:'Ringkasan',orders:'Pesanan',products:'Menu & Harga',partners:'Mitra & Pendaftar',settlements:'Pembayaran Mitra',analytics:'Analitik & Laporan'}[activeView]||'Dashboard'); if(activeView==='overview')host.innerHTML=renderOverview();if(activeView==='orders')host.innerHTML=renderOrders();if(activeView==='products')host.innerHTML=renderProductsAdmin();if(activeView==='partners')host.innerHTML=renderPartnersAdmin();if(activeView==='settlements')host.innerHTML=renderSettlementsAdmin();if(activeView==='analytics')host.innerHTML=renderAnalyticsAdmin();bindAdminViewEvents();}
function sum(rows,key){return rows.reduce((s,r)=>s+Number(r[key]||0),0)}
function renderOverview(){
 const today=new Date();today.setHours(0,0,0,0);const orderToday=orders.filter(o=>{const d=o.createdAt?.toDate?o.createdAt.toDate():new Date(o.createdAt||0);return d>=today;});const activeOrders=orders.filter(o=>!['delivered','cancelled'].includes(o.status));const confirmedRevenue=orders.filter(o=>o.paymentStatus==='paid'&&o.status!=='cancelled').reduce((s,o)=>s+Number(o.total||0),0);const expectedMargin=orders.filter(o=>o.paymentStatus==='paid'&&o.status!=='cancelled').reduce((s,o)=>s+Number(o.platformMargin||0),0);const duePayout=orders.filter(o=>o.paymentStatus==='paid'&&o.status==='delivered').reduce((s,o)=>s+(o.items||[]).filter(i=>i.settlementStatus!=='paid').reduce((t,i)=>t+Number(i.partnerCostTotal??Number(i.costPrice||0)*Number(i.qty||0)),0),0);
 const recent=[...orders].sort((a,b)=>dateMs(b.createdAt)-dateMs(a.createdAt)).slice(0,6);
 return `${adminPageHeader('Ringkasan operasional','Pantau pesanan, pendapatan, margin kotor, dan pembayaran mitra.')}
 <div class="kpi-grid"><div class="kpi-card"><div class="kpi-label">Pesanan hari ini <span class="kpi-icon">🧾</span></div><div class="kpi-value">${orderToday.length}</div><div class="kpi-note">${activeOrders.length} pesanan masih berjalan</div></div><div class="kpi-card"><div class="kpi-label">Omzet terbayar <span class="kpi-icon">💳</span></div><div class="kpi-value">${money(confirmedRevenue)}</div><div class="kpi-note">Total pesanan berstatus sudah dibayar</div></div><div class="kpi-card"><div class="kpi-label">Margin kotor tercatat <span class="kpi-icon">📈</span></div><div class="kpi-value">${money(expectedMargin)}</div><div class="kpi-note">Harga jual dikurangi biaya mitra; belum tentu laba bersih</div></div><div class="kpi-card"><div class="kpi-label">Pembayaran mitra tertunda <span class="kpi-icon">🤝</span></div><div class="kpi-value">${money(duePayout)}</div><div class="kpi-note">Pesanan terkirim, terbayar, belum diselesaikan ke mitra</div></div></div>
 <div class="admin-grid-main"><section class="admin-panel"><div class="panel-head"><div><h3>Pesanan terbaru</h3><p>Daftar terbaru yang masuk melalui website</p></div><button class="panel-link" data-goto="orders">Lihat semua ↗</button></div><div class="recent-list">${recent.length?recent.map(o=>`<div class="recent-row"><div><b>${escapeHtml(o.orderCode||o.id)}</b><small>${escapeHtml(o.customer?.name||o.customerName||'Pelanggan')} · ${formatDateTime(o.createdAt)}</small><small>${escapeHtml(statusLabel(o.status))} · ${escapeHtml(statusLabel(o.paymentStatus||'unpaid'))}</small></div><div><strong>${money(o.total)}</strong><small>${escapeHtml(o.itemCount??(o.items||[]).reduce((s,i)=>s+Number(i.qty||0),0))} box</small></div></div>`).join(''):'<div class="empty-panel">Belum ada pesanan masuk.</div>'}</div></section><section class="admin-panel"><div class="panel-head"><div><h3>Perlu ditindaklanjuti</h3><p>Daftar pekerjaan pengelola</p></div></div><div class="recent-list"><div class="recent-row"><div><b>Pesanan baru</b><small>Perlu konfirmasi ketersediaan dan tanggal</small></div><span class="status-pill status-new">${orders.filter(o=>o.status==='new').length}</span></div><div class="recent-row"><div><b>Menunggu pembayaran</b><small>Konfirmasi transfer secara manual</small></div><span class="status-pill status-unpaid">${orders.filter(o=>o.paymentStatus!=='paid'&&o.status!=='cancelled').length}</span></div><div class="recent-row"><div><b>Pendaftar mitra</b><small>Tinjau data dan kapasitas penjual</small></div><span class="status-pill status-pending">${applications.filter(a=>a.status==='pending').length}</span></div><div class="recent-row"><div><b>Pembayaran mitra</b><small>Rekap pesanan selesai dan terbayar</small></div><span class="status-pill status-ready">${orders.filter(o=>o.paymentStatus==='paid'&&o.status==='delivered'&&o.settlementStatus!=='paid').length}</span></div><div class="recent-row"><div><b>Menu aktif</b><small>Menu yang tampil di etalase</small></div><span class="status-pill status-active">${(window.adminCatalogCache||[]).filter(p=>p.status==='active').length}</span></div></div></section></div>
 <div class="admin-grid-main"><section class="admin-panel"><div class="panel-head"><div><h3>Alur kerja utama</h3><p>Proses pesanan yang disarankan</p></div></div><div class="recent-list"><div class="recent-row"><div><b>1. Konfirmasi pesanan</b><small>Periksa tanggal, stok mitra, area antar, dan total biaya.</small></div><span>①</span></div><div class="recent-row"><div><b>2. Verifikasi pembayaran</b><small>Periksa mutasi rekening sebelum menandai pesanan sudah dibayar.</small></div><span>②</span></div><div class="recent-row"><div><b>3. Tandai terkirim</b><small>Update status setelah pesanan diterima pelanggan.</small></div><span>③</span></div><div class="recent-row"><div><b>4. Bayar mitra</b><small>Catat pembayaran berdasarkan pesanan terkirim dan sudah dibayar.</small></div><span>④</span></div></div></section><section class="admin-panel"><div class="panel-head"><div><h3>Prinsip harga</h3><p>Margin dihitung otomatis per pesanan</p></div></div><div class="recent-list"><div class="recent-row"><div><b>Harga jual pelanggan</b><small>Harga yang ditampilkan di katalog BoxKita</small></div><strong>Rp…</strong></div><div class="recent-row"><div><b>Biaya mitra</b><small>Jumlah yang menjadi hak mitra untuk menu terjual</small></div><strong>Rp…</strong></div><div class="recent-row"><div><b>Margin kotor pengelola</b><small>Harga jual − biaya mitra; belum dikurangi biaya operasional, pajak, dan subsidi antar</small></div><strong class="margin-positive">Rp…</strong></div><p class="form-footnote" style="padding:12px 18px">Pastikan biaya mitra disepakati tertulis. Ongkir dan biaya tambahan belum otomatis masuk kalkulasi item.</p></div></section></div>`;
}
function dateMs(v){const d=v?.toDate?v.toDate():new Date(v||0);return d.getTime()||0;}
function renderOrders(){
 const statusOpts=[['all','Semua status'],['new','Pesanan baru'],['confirmed','Dikonfirmasi'],['preparing','Disiapkan'],['ready','Siap dikirim'],['delivered','Terkirim/selesai'],['cancelled','Dibatalkan']];
 const paymentOpts=[['all','Semua pembayaran'],['unpaid','Belum dibayar'],['paid','Sudah dibayar']];
 return `${adminPageHeader('Manajemen pesanan','Konfirmasi detail, status pembayaran, progres dapur, dan pengantaran.')}
 <div class="admin-toolbar"><label class="admin-search"><input id="orderSearch" placeholder="Cari kode pesanan, pelanggan, atau nomor WA…"></label><select id="orderStatusFilter" class="admin-select">${statusOpts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><select id="paymentStatusFilter" class="admin-select">${paymentOpts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><span class="toolbar-count" id="orderCount">${orders.length} pesanan</span></div><section class="admin-panel"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Kode / tanggal</th><th>Pelanggan</th><th>Pesanan</th><th>Nilai</th><th>Status</th><th>Pembayaran</th><th>Aksi</th></tr></thead><tbody id="ordersTbody"></tbody></table></div></section>`;
}
function renderOrdersRows(){const host=byId('ordersTbody');if(!host)return;const q=(byId('orderSearch')?.value||'').toLowerCase(),sf=byId('orderStatusFilter')?.value||'all',pf=byId('paymentStatusFilter')?.value||'all';let rows=[...orders].sort((a,b)=>dateMs(b.createdAt)-dateMs(a.createdAt)).filter(o=>{const hay=`${o.orderCode||o.id} ${o.customer?.name||o.customerName||''} ${o.customer?.phone||o.customerPhone||''}`.toLowerCase();return hay.includes(q)&&(sf==='all'||o.status===sf)&&(pf==='all'||(o.paymentStatus||'unpaid')===pf);});byId('orderCount').textContent=`${rows.length} pesanan`;
 if(!rows.length){host.innerHTML='<tr><td colspan="7"><div class="empty-panel">Tidak ada pesanan yang cocok dengan filter ini.</div></td></tr>';return;}
 host.innerHTML=rows.map(o=>{const c=o.customer||{name:o.customerName,phone:o.customerPhone,address:o.address};const lines=(o.items||[]).map(i=>`${i.name||i.productName||i.productId} × ${i.qty}`).join('<br>');return `<tr><td><b>${escapeHtml(o.orderCode||o.id)}</b><small>${formatDateTime(o.createdAt)}</small><small>${escapeHtml(o.deliveryDate||'Tanggal belum diatur')}</small></td><td><b>${escapeHtml(c.name||'—')}</b><small>${escapeHtml(c.phone||'')}</small><small>${escapeHtml(c.address||'')}</small></td><td>${lines||'—'}<small>${escapeHtml(o.notes||'')}</small></td><td><b>${money(o.total)}</b><small>Margin: ${money(o.platformMargin)}</small><small>Mitra: ${money(o.partnerPayoutTotal||o.partnerCostTotal)}</small></td><td><span class="${statusClass(o.status)}">${escapeHtml(statusLabel(o.status))}</span><small style="margin-top:6px">${escapeHtml(o.settlementStatus==='paid'?'Mitra sudah dibayar':'Pembayaran mitra: '+(o.settlementStatus||'tertunda'))}</small></td><td><span class="${statusClass(o.paymentStatus||'unpaid')}">${escapeHtml(statusLabel(o.paymentStatus||'unpaid'))}</span></td><td><div class="table-actions"><button class="table-action" data-order-detail="${escapeHtml(o.id)}">Detail</button><button class="table-action" data-order-update="${escapeHtml(o.id)}">Ubah status</button></div></td></tr>`;}).join('');
}
function renderProductsAdmin(){return `${adminPageHeader('Menu & harga jual','Kelola katalog publik, mitra pemasok, harga modal mitra, dan margin pengelola.','Tambah menu','addProductBtn')}<div class="admin-toolbar"><label class="admin-search"><input id="productSearchAdmin" placeholder="Cari nama menu atau mitra…"></label><select id="productStatusFilter" class="admin-select"><option value="all">Semua status</option><option value="active">Aktif</option><option value="paused">Nonaktif</option></select><span class="toolbar-count" id="productCount">${(window.adminProducts||[]).length} menu</span></div><section class="admin-panel"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Menu</th><th>Mitra</th><th>Harga modal</th><th>Harga jual</th><th>Margin / box</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="productsTbody"></tbody></table></div></section>`;}
function renderProductsRows(){const host=byId('productsTbody');if(!host)return;const list=window.adminProducts||[],q=(byId('productSearchAdmin')?.value||'').toLowerCase(),f=byId('productStatusFilter')?.value||'all';const rows=list.filter(p=>`${p.name} ${p.partnerName||''} ${p.category||''}`.toLowerCase().includes(q)&&(f==='all'||p.status===f));byId('productCount').textContent=`${rows.length} menu`;if(!rows.length){host.innerHTML='<tr><td colspan="8"><div class="empty-panel">Belum ada data menu. Tambahkan menu pertama setelah data mitra tersedia.</div></td></tr>';return;}host.innerHTML=rows.map(p=>`<tr><td><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.category||'Nasi Box')} · ${escapeHtml(p.area||'Semua wilayah')}</small><small>${escapeHtml(p.description||'')}</small></td><td>${escapeHtml(p.partnerName||'—')}</td><td>${money(p.costPrice)}</td><td><b>${money(p.salePrice)}</b></td><td class="margin-positive">${money(Number(p.salePrice||0)-Number(p.costPrice||0))}<small class="margin-small">${Number(p.salePrice)>0?((Number(p.salePrice)-Number(p.costPrice))/Number(p.salePrice)*100).toFixed(1)+'% dari harga jual':'—'}</small></td><td>${Number(p.stock??0)}</td><td><span class="${statusClass(p.status)}">${escapeHtml(statusLabel(p.status))}</span></td><td><div class="table-actions"><button class="table-action" data-product-edit="${escapeHtml(p.id)}">Edit</button><button class="table-action" data-product-toggle="${escapeHtml(p.id)}">${p.status==='active'?'Nonaktifkan':'Aktifkan'}</button></div></td></tr>`).join('');}
function renderPartnersAdmin(){return `${adminPageHeader('Mitra & pendaftar','Kelola data dapur, kontak, rekening pembayaran, dan proses persetujuan mitra.','Tambah mitra','addPartnerBtn')}<div class="admin-toolbar"><label class="admin-search"><input id="partnerSearchAdmin" placeholder="Cari nama usaha, area, atau kontak…"></label><select id="partnerListFilter" class="admin-select"><option value="all">Semua mitra</option><option value="active">Aktif</option><option value="paused">Nonaktif</option></select><span class="toolbar-count">${partners.length} mitra · ${applications.filter(a=>a.status==='pending').length} pendaftar baru</span></div><section class="admin-panel"><div class="panel-head"><div><h3>Daftar mitra</h3><p>Data rekening hanya terlihat oleh akun administrator.</p></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Usaha</th><th>Kontak</th><th>Area / kapasitas</th><th>Spesialisasi</th><th>Rekening mitra</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="partnersTbody"></tbody></table></div></section><section class="admin-panel" style="margin-top:16px"><div class="panel-head"><div><h3>Pendaftaran mitra masuk</h3><p>Tinjau data sebelum membuat mitra aktif.</p></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Usaha / penanggung jawab</th><th>WhatsApp</th><th>Area</th><th>Kapasitas / spesialisasi</th><th>Tanggal daftar</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="applicationsTbody"></tbody></table></div></section>`;}
function renderPartnersRows(){const host=byId('partnersTbody'), appHost=byId('applicationsTbody');if(!host)return;const q=(byId('partnerSearchAdmin')?.value||'').toLowerCase(),f=byId('partnerListFilter')?.value||'all';const rows=partners.filter(p=>`${p.name} ${p.contactName||''} ${p.phone||''} ${p.area||''}`.toLowerCase().includes(q)&&(f==='all'||p.status===f));host.innerHTML=rows.length?rows.map(p=>`<tr><td><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.contactName||'')}</small></td><td>${escapeHtml(p.phone||'—')}<small>${escapeHtml(p.email||'')}</small></td><td>${escapeHtml(p.area||'—')}<small>${escapeHtml(p.capacity||'—')}</small></td><td>${escapeHtml(p.specialty||'—')}</td><td>${escapeHtml(p.bankName||'Belum diatur')}<small>${escapeHtml(p.bankAccountName||'')} ${p.bankAccountNo?'· '+escapeHtml(p.bankAccountNo):''}</small></td><td><span class="${statusClass(p.status)}">${escapeHtml(statusLabel(p.status))}</span></td><td><div class="table-actions"><button class="table-action" data-partner-edit="${escapeHtml(p.id)}">Edit</button><button class="table-action" data-partner-toggle="${escapeHtml(p.id)}">${p.status==='active'?'Nonaktifkan':'Aktifkan'}</button></div></td></tr>`).join(''):'<tr><td colspan="7"><div class="empty-panel">Belum ada mitra pada filter ini.</div></td></tr>';
 const pending=applications.filter(a=>a.status==='pending');appHost.innerHTML=pending.length?pending.map(a=>`<tr><td><b>${escapeHtml(a.businessName||a.name)}</b><small>${escapeHtml(a.contactName||'')}</small><small>${escapeHtml(a.specialty||a.notes||'')}</small></td><td>${escapeHtml(a.phone||'—')}</td><td>${escapeHtml(a.area||'—')}</td><td>${escapeHtml(a.capacity||'—')}</td><td>${formatDateTime(a.createdAt)}</td><td><span class="${statusClass(a.status)}">${escapeHtml(statusLabel(a.status))}</span></td><td><div class="table-actions"><button class="table-action" data-application-approve="${escapeHtml(a.id)}">Setujui</button><button class="table-action" data-application-reject="${escapeHtml(a.id)}">Tolak</button></div></td></tr>`).join(''):'<tr><td colspan="7"><div class="empty-panel">Tidak ada pendaftaran yang menunggu tinjauan.</div></td></tr>';
}
function renderSettlementsAdmin(){
 const eligible=orders.filter(o=>o.paymentStatus==='paid'&&o.status==='delivered'&&(o.items||[]).some(i=>i.settlementStatus!=='paid'));const map=new Map();for(const o of eligible){for(const i of (o.items||[])){const pid=i.partnerId||o.partnerId||'';if(!pid||i.settlementStatus==='paid')continue;const itemCost=Number(i.partnerCostTotal??(Number(i.costPrice||0)*Number(i.qty||0)));const entry=map.get(pid)||{partnerId:pid,partnerName:i.partnerName||o.partnerName||partners.find(p=>p.id===pid)?.name||'Mitra',amount:0,orders:new Set(),units:0};entry.amount+=itemCost;entry.orders.add(o.id);entry.units+=Number(i.qty||0);map.set(pid,entry);}}
 const cards=[...map.values()];return `${adminPageHeader('Pembayaran mitra','Catat pembayaran biaya produk kepada mitra berdasarkan pesanan yang sudah terkirim dan sudah dibayar.')}
 <div class="kpi-grid"><div class="kpi-card"><div class="kpi-label">Pesanan layak dibayar <span class="kpi-icon">📦</span></div><div class="kpi-value">${eligible.length}</div><div class="kpi-note">Sudah terkirim dan pembayaran pelanggan terverifikasi</div></div><div class="kpi-card"><div class="kpi-label">Total perkiraan pembayaran <span class="kpi-icon">🤝</span></div><div class="kpi-value">${money(eligible.reduce((s,o)=>s+(o.items||[]).filter(i=>i.settlementStatus!=='paid').reduce((t,i)=>t+Number(i.partnerCostTotal??Number(i.costPrice||0)*Number(i.qty||0)),0),0))}</div><div class="kpi-note">Nilai perkiraan menurut snapshot pesanan; validasi per mitra sebelum mencatat pembayaran</div></div><div class="kpi-card"><div class="kpi-label">Transaksi pembayaran tercatat <span class="kpi-icon">🧾</span></div><div class="kpi-value">${settlements.length}</div><div class="kpi-note">Riwayat penyelesaian pembayaran mitra</div></div><div class="kpi-card"><div class="kpi-label">Mitra aktif <span class="kpi-icon">♧</span></div><div class="kpi-value">${partners.filter(p=>p.status==='active').length}</div><div class="kpi-note">Mitra yang dapat menerima pesanan</div></div></div>
 <div class="section-kicker" style="margin:24px 0 12px">REKAP PER MITRA</div><div class="settlement-grid">${cards.length?cards.map(c=>`<article class="settlement-card"><h3>${escapeHtml(c.partnerName)}</h3><p>${c.orders.size} pesanan · ${c.units} box · Pesanan terkirim & terbayar</p><div class="settlement-amount">${money(c.amount)}</div><div class="settlement-meta">Nominal dihitung dari biaya modal setiap item, bukan harga jual pelanggan.</div><button class="btn btn-primary btn-full" data-settle-partner="${escapeHtml(c.partnerId)}">Catat pembayaran & lunasi ↗</button></article>`).join(''):'<div class="admin-panel" style="padding:20px"><div class="empty-panel">Belum ada pembayaran mitra yang perlu dicatat. Tandai pesanan sebagai sudah dibayar dan terkirim terlebih dahulu.</div></div>'}</div>
 <section class="admin-panel" style="margin-top:22px"><div class="panel-head"><div><h3>Riwayat pembayaran</h3><p>Semua pembayaran yang telah dicatat dari dashboard ini.</p></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Kode pembayaran</th><th>Mitra</th><th>Tanggal</th><th>Jumlah</th><th>Metode / referensi</th><th>Pesanan tercakup</th></tr></thead><tbody>${settlements.length?[...settlements].sort((a,b)=>dateMs(b.createdAt)-dateMs(a.createdAt)).map(s=>`<tr><td><b>${escapeHtml(s.settlementCode||s.id)}</b></td><td>${escapeHtml(s.partnerName||partners.find(p=>p.id===s.partnerId)?.name||'—')}</td><td>${formatDateTime(s.createdAt)}</td><td><b>${money(s.amount)}</b></td><td>${escapeHtml(s.method||'—')}<small>${escapeHtml(s.reference||'')}</small></td><td>${escapeHtml((s.orderCodes||[]).join(', ')||`${(s.orderIds||[]).length} pesanan`)}</td></tr>`).join(''):'<tr><td colspan="6"><div class="empty-panel">Belum ada riwayat pembayaran.</div></td></tr>'}</tbody></table></div></section>`;
}
function getAnalyticsOrders(){
 const days=analyticsPeriod==='all'?0:Number(analyticsPeriod||30);
 if(!days)return [...orders];
 const cutoff=Date.now()-days*24*60*60*1000;
 return orders.filter(o=>dateMs(o.createdAt)>=cutoff);
}
function orderGrossMargin(o){
 if(Number.isFinite(Number(o.platformMargin)))return Number(o.platformMargin||0);
 return (o.items||[]).reduce((sum,i)=>sum+Number(i.platformMargin??((Number(i.unitPrice||0)-Number(i.costPrice||0))*Number(i.qty||0))),0);
}
function analyticsProductRows(sourceOrders){
 const catalog=window.adminProducts||[];const byId=new Map(catalog.map(p=>[String(p.id),p]));const map=new Map();
 for(const o of sourceOrders){if(o.paymentStatus!=='paid'||o.status==='cancelled')continue;for(const i of (o.items||[])){
  const id=String(i.productId||i.id||i.name||'menu');const p=byId.get(id)||{};const qty=Number(i.qty||0);const unit=Number(i.unitPrice??p.salePrice??0);const total=Number(i.lineTotal??unit*qty);const cost=Number(i.partnerCostTotal??Number(i.costPrice??p.costPrice??0)*qty);const margin=Number(i.platformMargin??(total-cost));
  const row=map.get(id)||{id,name:i.name||p.name||id,category:i.category||p.category||'Lainnya',units:0,revenue:0,cost:0,margin:0,orders:0};row.units+=qty;row.revenue+=total;row.cost+=cost;row.margin+=margin;row.orders+=1;map.set(id,row);
 }}
 return [...map.values()].sort((a,b)=>b.revenue-a.revenue);
}
function renderAnalyticsAdmin(){
 const filtered=getAnalyticsOrders();const paid=filtered.filter(o=>o.paymentStatus==='paid'&&o.status!=='cancelled'&&o.paymentStatus!=='refunded');
 const revenue=paid.reduce((sum,o)=>sum+Number(o.total||0),0);const margin=paid.reduce((sum,o)=>sum+orderGrossMargin(o),0);const payout=paid.filter(o=>o.status==='delivered').reduce((sum,o)=>sum+(o.items||[]).filter(i=>i.settlementStatus!=='paid').reduce((t,i)=>t+Number(i.partnerCostTotal??Number(i.costPrice||0)*Number(i.qty||0)),0),0);
 const units=paid.reduce((sum,o)=>sum+Number(o.itemCount??(o.items||[]).reduce((n,i)=>n+Number(i.qty||0),0)),0);const avg=paid.length?revenue/paid.length:0;
 const trend=Array.from({length:7},(_,idx)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-idx));const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const rows=paid.filter(o=>{const v=dateMs(o.createdAt);if(!Number.isFinite(v))return false;const od=new Date(v);const orderKey=`${od.getFullYear()}-${String(od.getMonth()+1).padStart(2,'0')}-${String(od.getDate()).padStart(2,'0')}`;return orderKey===key;});return {key,label:d.toLocaleDateString('id-ID',{weekday:'short'}),amount:rows.reduce((a,o)=>a+Number(o.total||0),0),orders:rows.length};});const maxTrend=Math.max(1,...trend.map(x=>x.amount));
 const best=analyticsProductRows(filtered).slice(0,5);
 const areasMap=new Map();paid.forEach(o=>{const area=o.customer?.deliveryArea||o.deliveryArea||'Belum ditentukan';const row=areasMap.get(area)||{area,orders:0,revenue:0};row.orders++;row.revenue+=Number(o.total||0);areasMap.set(area,row);});const topAreas=[...areasMap.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,5);
 const partnerMap=new Map();for(const o of paid){for(const i of (o.items||[])){const pid=i.partnerId||o.partnerId||'unknown';const row=partnerMap.get(pid)||{id:pid,name:i.partnerName||o.partnerName||partners.find(p=>p.id===pid)?.name||'Mitra belum ditentukan',units:0,revenue:0,margin:0};row.units+=Number(i.qty||0);row.revenue+=Number(i.lineTotal??Number(i.unitPrice||0)*Number(i.qty||0));row.margin+=Number(i.platformMargin??((Number(i.unitPrice||0)-Number(i.costPrice||0))*Number(i.qty||0)));partnerMap.set(pid,row);}}
 const topPartners=[...partnerMap.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,5);
 const alerts=[];const newOrders=filtered.filter(o=>o.status==='new').length;const unpaid=filtered.filter(o=>o.paymentStatus!=='paid'&&o.status!=='cancelled').length;const pendingApps=applications.filter(a=>a.status==='pending').length;const lowStock=(window.adminProducts||[]).filter(p=>p.status==='active'&&Number(p.stock||0)<=10);
 if(newOrders)alerts.push({ico:'🧾',title:`${newOrders} pesanan baru`,desc:'Perlu ditinjau dan dikonfirmasi.',view:'orders'});
 if(unpaid)alerts.push({ico:'💳',title:`${unpaid} pesanan belum dibayar`,desc:'Cek konfirmasi pembayaran secara manual.',view:'orders'});
 if(pendingApps)alerts.push({ico:'🤝',title:`${pendingApps} pendaftar mitra menunggu`,desc:'Periksa data dan kapasitas usaha.',view:'partners'});
 if(lowStock.length)alerts.push({ico:'📦',title:`${lowStock.length} menu stok tipis`,desc:'Stok aktif tinggal 10 box atau kurang.',view:'products'});
 const productRows=best.length?best.map((p,i)=>`<tr><td><b>${i+1}. ${escapeHtml(p.name)}</b><small>${escapeHtml(p.category)}</small></td><td>${p.units}</td><td>${money(p.revenue)}</td><td class="margin-positive">${money(p.margin)}</td></tr>`).join(''):'<tr><td colspan="4"><div class="empty-panel">Belum ada data menu terjual dari pesanan yang sudah dibayar.</div></td></tr>';
 const areaRows=topAreas.length?topAreas.map(a=>`<tr><td><b>${escapeHtml(a.area)}</b></td><td>${a.orders}</td><td>${money(a.revenue)}</td></tr>`).join(''):'<tr><td colspan="3"><div class="empty-panel">Data area akan muncul setelah ada pesanan terbayar.</div></td></tr>';
 const partnerRows=topPartners.length?topPartners.map(p=>`<tr><td><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.id)}</small></td><td>${p.units}</td><td>${money(p.revenue)}</td><td class="margin-positive">${money(p.margin)}</td></tr>`).join(''):'<tr><td colspan="4"><div class="empty-panel">Belum ada performa mitra dari pesanan terbayar.</div></td></tr>';
 return `${adminPageHeader('Analitik & laporan','Pantau tren penjualan, margin kotor, menu favorit pelanggan, performa mitra, dan area layanan.')}<div class="analytics-toolbar"><label>Periode laporan<select id="analyticsPeriod" class="admin-select"><option value="7" ${analyticsPeriod==='7'?'selected':''}>7 hari terakhir</option><option value="30" ${analyticsPeriod==='30'?'selected':''}>30 hari terakhir</option><option value="90" ${analyticsPeriod==='90'?'selected':''}>90 hari terakhir</option><option value="all" ${analyticsPeriod==='all'?'selected':''}>Semua data</option></select></label><div class="analytics-toolbar-actions"><button class="btn btn-ghost btn-sm" data-report-export="orders">⇩ Pesanan CSV</button><button class="btn btn-ghost btn-sm" data-report-export="products">⇩ Menu CSV</button><button class="btn btn-ghost btn-sm" data-report-export="partners">⇩ Mitra CSV</button><button class="btn btn-ghost btn-sm" data-report-export="settlements">⇩ Pembayaran CSV</button></div></div>
 <div class="analytics-kpi-grid"><article class="analytics-kpi"><span>💳 Omzet terbayar</span><b>${money(revenue)}</b><small>${paid.length} pesanan terbayar · ${analyticsPeriod==='all'?'seluruh periode':`${analyticsPeriod} hari terakhir`}</small></article><article class="analytics-kpi"><span>📈 Margin kotor</span><b>${money(margin)}</b><small>Belum dipotong operasional, pajak, promosi, dan ongkir</small></article><article class="analytics-kpi"><span>🍱 Box terjual</span><b>${units.toLocaleString('id-ID')}</b><small>Dari pesanan yang telah dibayar</small></article><article class="analytics-kpi"><span>🧾 Rata-rata pesanan</span><b>${money(avg)}</b><small>Omzet terbayar dibagi jumlah pesanan</small></article></div>
 <div class="analytics-layout"><section class="admin-panel analytics-trend-panel"><div class="panel-head"><div><h3>Tren omzet 7 hari terakhir</h3><p>Hanya pesanan berstatus sudah dibayar</p></div><span class="analytics-chart-icon">↗</span></div><div class="analytics-bars">${trend.map(d=>`<div class="analytics-bar-column"><div class="analytics-bar-value">${d.amount?escapeHtml(money(d.amount)):'—'}</div><div class="analytics-bar-track"><div class="analytics-bar-fill" style="height:${Math.max(d.amount?6:0,(d.amount/maxTrend)*100)}%" title="${escapeHtml(money(d.amount))}"></div></div><b>${escapeHtml(d.label)}</b><small>${d.orders} order</small></div>`).join('')}</div></section><section class="admin-panel analytics-alert-panel"><div class="panel-head"><div><h3>Pusat perhatian</h3><p>Hal operasional yang perlu dicek</p></div><span class="analytics-chart-icon">✦</span></div><div class="analytics-alert-list">${alerts.length?alerts.map(a=>`<button class="analytics-alert" type="button" data-goto="${a.view}"><span>${a.ico}</span><span><b>${escapeHtml(a.title)}</b><small>${escapeHtml(a.desc)}</small></span><i>↗</i></button>`).join(''):'<div class="empty-panel">Tidak ada peringatan prioritas saat ini. Tetap periksa pesanan dan stok secara berkala.</div>'}</div><div class="analytics-payout-note"><span>🤝 Pembayaran mitra tertunda</span><b>${money(payout)}</b><small>Untuk pesanan yang sudah terbayar dan terkirim, tetapi belum diselesaikan.</small></div></section></div>
 <section class="admin-panel analytics-table-panel"><div class="panel-head"><div><h3>Menu terlaris</h3><p>Diurutkan menurut nilai penjualan dari pesanan terbayar</p></div><button class="panel-link" data-goto="products">Kelola menu ↗</button></div><div class="data-table-wrap"><table class="data-table analytics-table"><thead><tr><th>Menu</th><th>Box terjual</th><th>Nilai penjualan</th><th>Margin kotor</th></tr></thead><tbody>${productRows}</tbody></table></div></section>
 <div class="analytics-layout"><section class="admin-panel analytics-table-panel"><div class="panel-head"><div><h3>Performa mitra</h3><p>Omzet dan margin produk mitra</p></div><button class="panel-link" data-goto="partners">Kelola mitra ↗</button></div><div class="data-table-wrap"><table class="data-table analytics-table"><thead><tr><th>Mitra</th><th>Box</th><th>Nilai penjualan</th><th>Margin kotor</th></tr></thead><tbody>${partnerRows}</tbody></table></div></section><section class="admin-panel analytics-table-panel"><div class="panel-head"><div><h3>Area dengan penjualan tertinggi</h3><p>Disusun menurut omzet pesanan terbayar</p></div></div><div class="data-table-wrap"><table class="data-table analytics-table"><thead><tr><th>Area</th><th>Pesanan</th><th>Omzet</th></tr></thead><tbody>${areaRows}</tbody></table></div></section></div>
 <p class="analytics-footnote">Privasi: laporan ini hanya tersedia di dashboard administrator yang sudah terverifikasi. Berkas CSV pesanan dapat memuat nama, nomor telepon, dan alamat pelanggan—simpan dengan aman. Angka laporan hanya seakurat data yang sudah tercatat di Firestore.</p>`;
}
function csvCell(value){let text=String(value??'');if(/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}
function downloadCsv(filename,rows){if(!rows.length){showToast('Tidak ada data untuk diekspor.');return;}const csv='\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast('Laporan CSV berhasil dibuat.');}
function exportAdminReport(type){
 const stamp=new Date().toISOString().slice(0,10);let rows=[],filename=`boxkita-${type}-${stamp}.csv`;
 if(type==='orders'){rows=[['Kode pesanan','Tanggal masuk','Nama pelanggan','WhatsApp','Area pengiriman','Tanggal dibutuhkan','Jumlah box','Total','Status pesanan','Status pembayaran','Biaya mitra','Margin kotor','Catatan internal'],...getAnalyticsOrders().map(o=>[o.orderCode||o.id,formatDateTime(o.createdAt),o.customer?.name||o.customerName||'',o.customer?.phone||o.customerPhone||'',o.customer?.deliveryArea||o.deliveryArea||'',o.customer?.deliveryDate||o.deliveryDate||'',o.itemCount??(o.items||[]).reduce((n,i)=>n+Number(i.qty||0),0),o.total||0,statusLabel(o.status),statusLabel(o.paymentStatus||'unpaid'),o.partnerCostTotal??(o.items||[]).reduce((n,i)=>n+Number(i.partnerCostTotal??Number(i.costPrice||0)*Number(i.qty||0)),0),orderGrossMargin(o),o.adminNote||''])];}
 else if(type==='products'){rows=[['ID menu','Nama','Kategori','Mitra','Area','Harga modal','Harga jual','Margin per box','Stok','Status'],...(window.adminProducts||[]).map(p=>[p.id,p.name,p.category,p.partnerName||partners.find(x=>x.id===p.partnerId)?.name||'',p.area,p.costPrice||0,p.salePrice||0,Number(p.salePrice||0)-Number(p.costPrice||0),p.stock||0,statusLabel(p.status)])];}
 else if(type==='partners'){rows=[['ID mitra','Nama usaha','Penanggung jawab','WhatsApp','Area','Kapasitas','Spesialisasi','Status'],...partners.map(p=>[p.id,p.name,p.contactName,p.phone,p.area,p.capacity,p.specialty,statusLabel(p.status)])];}
 else if(type==='settlements'){rows=[['Kode pembayaran','Mitra','Tanggal','Jumlah','Metode','Referensi','Kode pesanan'],...settlements.map(s=>[s.settlementCode||s.id,s.partnerName||partners.find(p=>p.id===s.partnerId)?.name||'',formatDateTime(s.createdAt),s.amount||0,s.method||'',s.reference||'',(s.orderCodes||s.orderIds||[]).join('; ')])];}
 downloadCsv(filename,rows);
}
function bindAdminViewEvents(){if(activeView==='overview'){document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>switchAdminView(b.dataset.goto)));} if(activeView==='analytics'){const filter=byId('analyticsPeriod');if(filter)filter.addEventListener('change',()=>{analyticsPeriod=filter.value;renderAdminView();});document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>switchAdminView(b.dataset.goto)));}
 if(activeView==='orders'){['orderSearch','orderStatusFilter','paymentStatusFilter'].forEach(id=>byId(id).addEventListener(id==='orderSearch'?'input':'change',renderOrdersRows));renderOrdersRows();}
 if(activeView==='products'){byId('addProductBtn').addEventListener('click',()=>openProductForm());['productSearchAdmin','productStatusFilter'].forEach(id=>byId(id).addEventListener(id==='productSearchAdmin'?'input':'change',renderProductsRows));renderProductsRows();}
 if(activeView==='partners'){byId('addPartnerBtn').addEventListener('click',()=>openPartnerForm());['partnerSearchAdmin','partnerListFilter'].forEach(id=>byId(id).addEventListener(id==='partnerSearchAdmin'?'input':'change',renderPartnersRows));renderPartnersRows();}
 if(activeView==='settlements'){document.querySelectorAll('[data-settle-partner]').forEach(b=>b.addEventListener('click',()=>startSettlement(b.dataset.settlePartner)));}
}
function switchAdminView(view){activeView=view;document.querySelectorAll('.admin-nav[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));renderAdminView();}

function showFormModal(title,content,submitHandler,eyebrow='DATA MASTER'){byId('formModalTitle').textContent=title;byId('formModalEyebrow').textContent=eyebrow;byId('formModalBody').innerHTML=content;cachedModalSubmit=submitHandler;}
byId('formModalBody').addEventListener('submit',async e=>{const form=e.target.closest('form[data-admin-form]');if(!form)return;e.preventDefault();if(!cachedModalSubmit)return;try{await cachedModalSubmit(form);}catch(error){console.error(error);showToast(error?.message||'Data belum berhasil disimpan.');}});
const partnerOptions = selected => `<option value="">Pilih mitra pemasok</option>${partners.filter(p=>p.status==='active'||p.id===selected).map(p=>`<option value="${escapeHtml(p.id)}" ${p.id===selected?'selected':''}>${escapeHtml(p.name)}</option>`).join('')}`;
function openProductForm(id=null){const p=(window.adminProducts||[]).find(x=>x.id===id)||{};if(!partners.filter(x=>x.status==='active').length&&!p.partnerId){showToast('Tambahkan atau setujui minimal satu mitra terlebih dahulu.');return switchAdminView('partners');}
 showFormModal(id?'Edit menu':'Tambah menu',`<form class="admin-form" data-admin-form><div class="admin-form-grid"><label class="full">Nama menu<input name="name" required maxlength="120" value="${escapeHtml(p.name||'')}" placeholder="Nasi Box Ayam Bakar"></label><label>Mitra pemasok<select name="partnerId" required>${partnerOptions(p.partnerId)}</select></label><label>Kategori<select name="category" required>${['Jumat Barokah','Box Kita','Ayam','Ikan','Sapi','Vegetarian','Paket Hemat','Lainnya'].map(c=>`<option ${p.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Harga modal mitra / box<input name="costPrice" type="number" min="0" step="500" required value="${p.costPrice??''}" placeholder="17000"></label><label>Harga jual BoxKita / box<input name="salePrice" type="number" min="0" step="500" required value="${p.salePrice??''}" placeholder="22000"></label><label>Stok/kapasitas menu<input name="stock" type="number" min="0" step="1" required value="${p.stock??50}"></label><label>Status<select name="status"><option value="active" ${p.status!=='paused'?'selected':''}>Aktif — tampil di katalog</option><option value="paused" ${p.status==='paused'?'selected':''}>Nonaktif — sembunyikan</option></select></label><label>Emoji/icon menu<input name="emoji" maxlength="8" value="${escapeHtml(p.emoji||'🍱')}" placeholder="🍱"></label><label>Area layanan<select name="area">${areaSelectOptions(normalizeArea(p.area||'Semua wilayah'))}</select></label><label class="full">URL foto menu (opsional)<input name="imageUrl" type="url" value="${escapeHtml(p.imageUrl||'')}" placeholder="https://…"><small>Gunakan alamat gambar HTTPS yang bisa diakses publik. Upload file langsung belum termasuk pada starter ini.</small></label><label class="full">Deskripsi menu<textarea name="description" rows="3" maxlength="500" required placeholder="Komposisi menu, lauk, sayur, sambal…">${escapeHtml(p.description||'')}</textarea></label><div class="inline-stat full" id="marginPreview">Margin kotor per box: <b>${money(Number(p.salePrice||0)-Number(p.costPrice||0))}</b></div><div class="admin-form-note full">Harga modal adalah hak mitra per box. Harga jual adalah harga untuk pelanggan. Margin kotor = harga jual − harga modal, belum dipotong biaya lain atau pajak. Harga jual tidak boleh di bawah harga modal.</div></div><div class="admin-form-actions"><button type="button" class="btn btn-ghost" data-close="formModal">Batal</button><button type="submit" class="btn btn-primary">Simpan menu</button></div></form>`,async form=>{
 const name=getVal(form,'name'),partnerId=getVal(form,'partnerId'),category=getVal(form,'category'),costPrice=Number(getVal(form,'costPrice')),salePrice=Number(getVal(form,'salePrice')),stock=Number(getVal(form,'stock')),status=getVal(form,'status'),imageUrl=getVal(form,'imageUrl');if(!name||!partnerId||!Number.isFinite(costPrice)||!Number.isFinite(salePrice)||costPrice<0||salePrice<costPrice||stock<0)throw new Error('Periksa data. Harga jual wajib sama dengan atau lebih tinggi dari harga modal dan stok tidak boleh negatif.');if(imageUrl&&!/^https:\/\//i.test(imageUrl))throw new Error('URL foto harus menggunakan HTTPS.');const partner=partners.find(x=>x.id===partnerId);if(!partner)throw new Error('Mitra tidak ditemukan. Muat ulang data dan pilih kembali.');
 if(IS_DEMO){const sim=getSimulationState(),idVal=id||simulationId('MENU'),base={id:idVal,name,partnerId,partnerName:partner.name,category,costPrice,salePrice,stock,status,description:getVal(form,'description'),emoji:getVal(form,'emoji')||'🍱',imageUrl,area:getVal(form,'area')||partner.area||'Semua wilayah',updatedAt:localStamp(),createdAt:id?(p.createdAt||localStamp()):localStamp(),sort:p.sort??sim.products.length};const ix=sim.products.findIndex(x=>x.id===idVal);if(ix>=0)sim.products[ix]={...sim.products[ix],...base};else sim.products.push(base);persistSimulation();setBusy(true,'Memperbarui katalog simulasi…');try{closeModal('formModal');showToast('Menu dan harga tersimpan di simulasi.');await refreshAdminData();await loadCatalog();}finally{setBusy(false);}return;}
 const idVal=id||doc(collection(db,'products')).id, base={name,partnerId,partnerName:partner.name,category,costPrice,salePrice,stock,status,description:getVal(form,'description'),emoji:getVal(form,'emoji')||'🍱',imageUrl,area:getVal(form,'area')||partner.area||'Semua wilayah',updatedAt:serverTimestamp()};if(!id)base.createdAt=serverTimestamp();const catalog={name,description:base.description,category,sellerName:partner.name,partnerId,area:base.area,salePrice,imageUrl:base.imageUrl,emoji:base.emoji,status,stock,updatedAt:serverTimestamp()};if(!id)catalog.createdAt=serverTimestamp();const batch=writeBatch(db);batch.set(doc(db,'products',idVal),base,{merge:true});batch.set(doc(db,'catalog',idVal),catalog,{merge:true});setBusy(true,'Menyimpan menu dan harga…');try{await batch.commit();closeModal('formModal');showToast('Menu dan harga berhasil disimpan.');await refreshAdminData();await loadCatalog();}finally{setBusy(false);}
 },'KATALOG & HARGA');
 const costInput=byId('formModalBody').querySelector('[name="costPrice"]'),saleInput=byId('formModalBody').querySelector('[name="salePrice"]');const updateMargin=()=>{const val=Number(saleInput.value||0)-Number(costInput.value||0);byId('marginPreview').innerHTML=`Margin kotor per box: <b class="${val>=0?'margin-positive':''}">${money(val)}</b>`};costInput.addEventListener('input',updateMargin);saleInput.addEventListener('input',updateMargin);openModal('formModal');
}
function openPartnerForm(id=null,initial={}){const p=(partners.find(x=>x.id===id)||initial);showFormModal(id?'Edit data mitra':'Tambah mitra',`<form class="admin-form" data-admin-form><div class="admin-form-grid"><label class="full">Nama usaha / dapur<input name="name" required maxlength="120" value="${escapeHtml(p.name||p.businessName||'')}" placeholder="Dapur Bu Rina"></label><label>Nama penanggung jawab<input name="contactName" required maxlength="120" value="${escapeHtml(p.contactName||'')}"></label><label>Nomor WhatsApp<input name="phone" required maxlength="30" value="${escapeHtml(p.phone||'')}"></label><label>Area layanan<select name="area" required>${areaSelectOptions(normalizeArea(p.area||'Semua wilayah'))}</select></label><label>Kapasitas produksi<select name="capacity"><option ${p.capacity==='1–30 box/hari'?'selected':''}>1–30 box/hari</option><option ${p.capacity==='31–100 box/hari'?'selected':''}>31–100 box/hari</option><option ${p.capacity==='101–300 box/hari'?'selected':''}>101–300 box/hari</option><option ${p.capacity==='Lebih dari 300 box/hari'?'selected':''}>Lebih dari 300 box/hari</option></select></label><label class="full">Spesialisasi / menu unggulan<input name="specialty" maxlength="200" value="${escapeHtml(p.specialty||'')}" placeholder="Menu ayam, ikan, vegetarian…"></label><label>Nama bank<input name="bankName" maxlength="80" value="${escapeHtml(p.bankName||'')}" placeholder="Nama bank/e-wallet"></label><label>Nama pemilik rekening<input name="bankAccountName" maxlength="120" value="${escapeHtml(p.bankAccountName||'')}"></label><label class="full">Nomor rekening / tujuan pembayaran<input name="bankAccountNo" maxlength="80" value="${escapeHtml(p.bankAccountNo||'')}"></label><label>Status<select name="status"><option value="active" ${p.status!=='paused'?'selected':''}>Aktif</option><option value="paused" ${p.status==='paused'?'selected':''}>Nonaktif</option></select></label><label class="full">Catatan internal<textarea name="notes" rows="3" maxlength="600">${escapeHtml(p.notes||'')}</textarea></label><div class="admin-form-note full">Detail rekening mitra adalah data sensitif operasional. Batasi aksesnya pada pengelola dan gunakan hanya untuk pembayaran sesuai perjanjian kemitraan.</div></div><div class="admin-form-actions"><button type="button" class="btn btn-ghost" data-close="formModal">Batal</button><button type="submit" class="btn btn-primary">Simpan mitra</button></div></form>`,async form=>{const data={name:getVal(form,'name'),contactName:getVal(form,'contactName'),phone:getVal(form,'phone'),area:getVal(form,'area'),capacity:getVal(form,'capacity'),specialty:getVal(form,'specialty'),bankName:getVal(form,'bankName'),bankAccountName:getVal(form,'bankAccountName'),bankAccountNo:getVal(form,'bankAccountNo'),status:getVal(form,'status'),notes:getVal(form,'notes'),updatedAt:IS_DEMO?localStamp():serverTimestamp()};if(!data.name||!data.contactName||!data.phone||!data.area||!SERVICE_AREAS.includes(data.area))throw new Error('Nama usaha, penanggung jawab, WhatsApp, dan pilih satu area layanan harus diisi.');if(!id)data.createdAt=IS_DEMO?localStamp():serverTimestamp();setBusy(true,'Menyimpan mitra…');try{if(IS_DEMO){const sim=getSimulationState(),partnerId=id||simulationId('MITRA'),oldPartner=sim.partners.find(x=>x.id===partnerId),saveData={...data,id:partnerId,createdAt:id?(oldPartner?.createdAt||localStamp()):localStamp(),updatedAt:localStamp()};const ix=sim.partners.findIndex(x=>x.id===partnerId);if(ix>=0)sim.partners[ix]={...sim.partners[ix],...saveData};else sim.partners.push(saveData);const partnerWasPaused=oldPartner?.status==='paused';sim.products.forEach(product=>{if(product.partnerId===partnerId){product.partnerName=saveData.name;if(saveData.status==='paused')product.status='paused';else if(partnerWasPaused)product.status='active';product.updatedAt=localStamp();}});persistSimulation();closeModal('formModal');showToast('Data mitra tersimpan di simulasi.');await refreshAdminData();await loadCatalog();return;}const partnerId=id||doc(collection(db,'partners')).id;const oldPartner=partners.find(x=>x.id===partnerId);const batch=writeBatch(db);if(id)batch.set(doc(db,'partners',partnerId),data,{merge:true});else batch.set(doc(db,'partners',partnerId),data);const directory={name:data.name,area:data.area,specialty:data.specialty,status:data.status,updatedAt:serverTimestamp()};if(!id)directory.createdAt=serverTimestamp();batch.set(doc(db,'partnerDirectory',partnerId),directory,{merge:true});if(id){const linkedProducts=(window.adminProducts||[]).filter(x=>x.partnerId===partnerId);const linkedCatalog=(window.adminCatalogCache||[]).filter(x=>x.partnerId===partnerId);const partnerWasPaused=oldPartner?.status==='paused';linkedProducts.forEach(x=>{const update={partnerName:data.name,updatedAt:serverTimestamp()};if(data.status==='paused')update.status='paused';else if(partnerWasPaused)update.status='active';batch.update(doc(db,'products',x.id),update);});linkedCatalog.forEach(c=>{const update={sellerName:data.name,updatedAt:serverTimestamp()};if(data.status==='paused')update.status='paused';else if(partnerWasPaused)update.status='active';batch.update(doc(db,'catalog',c.id),update);});}await batch.commit();closeModal('formModal');showToast('Data mitra berhasil disimpan.');await refreshAdminData();await loadCatalog();}finally{setBusy(false);}},'DATA MITRA');openModal('formModal');}

// Generic admin table actions, attached once to the view container.
byId('adminView').addEventListener('click',async e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.dataset.orderDetail){const o=orders.find(x=>x.id===button.dataset.orderDetail);if(o)showOrderDetails(o);}
 if(button.dataset.orderUpdate){const o=orders.find(x=>x.id===button.dataset.orderUpdate);if(o)openOrderStatusForm(o);}
 if(button.dataset.productEdit)openProductForm(button.dataset.productEdit);
 if(button.dataset.productToggle){const p=(window.adminProducts||[]).find(x=>x.id===button.dataset.productToggle);if(p)toggleProduct(p);}
 if(button.dataset.partnerEdit)openPartnerForm(button.dataset.partnerEdit);
 if(button.dataset.partnerToggle){const p=partners.find(x=>x.id===button.dataset.partnerToggle);if(p)togglePartner(p);}
 if(button.dataset.applicationApprove){const a=applications.find(x=>x.id===button.dataset.applicationApprove);if(a)approveApplication(a);}
 if(button.dataset.applicationReject){const a=applications.find(x=>x.id===button.dataset.applicationReject);if(a)rejectApplication(a);}
 if(button.dataset.reportExport)exportAdminReport(button.dataset.reportExport);
});
function showOrderDetails(o){const c=o.customer||{name:o.customerName,phone:o.customerPhone,address:o.address};const body=`<div class="admin-form"><div class="inline-stat">Kode pesanan: <b>${escapeHtml(o.orderCode||o.id)}</b> · ${formatDateTime(o.createdAt)}</div><div class="inline-stat">Pelanggan: <b>${escapeHtml(c.name||'—')}</b><br>WhatsApp: <b>${escapeHtml(c.phone||'—')}</b><br>Tanggal kebutuhan: <b>${escapeHtml(o.deliveryDate||'—')}</b></div><div class="inline-stat">Alamat: <b>${escapeHtml(c.address||'—')}</b><br>Catatan: <b>${escapeHtml(o.notes||'—')}</b></div><section class="admin-panel"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Menu</th><th>Qty</th><th>Harga jual</th><th>Biaya mitra</th><th>Margin</th></tr></thead><tbody>${(o.items||[]).map(i=>`<tr><td><b>${escapeHtml(i.name||i.productName||i.productId)}</b><small>${escapeHtml(i.partnerName||'')}</small></td><td>${i.qty}</td><td>${money(i.unitPrice||0)}</td><td>${money(i.partnerCostTotal??Number(i.costPrice||0)*Number(i.qty||0))}</td><td class="margin-positive">${money(i.platformMargin??((Number(i.unitPrice||0)-Number(i.costPrice||0))*Number(i.qty||0)))}</td></tr>`).join('')}</tbody></table></div></section><div class="inline-stat">Total pelanggan: <b>${money(o.total)}</b><br>Status pesanan: <b>${escapeHtml(statusLabel(o.status))}</b><br>Status pembayaran: <b>${escapeHtml(statusLabel(o.paymentStatus||'unpaid'))}</b></div><div class="admin-form-actions"><button type="button" class="btn btn-ghost" data-close="formModal">Tutup</button><button type="button" class="btn btn-primary" id="detailUpdateStatus">Ubah status</button></div></div>`;showFormModal('Detail pesanan',body,null,'RINCIAN PESANAN');byId('formModalBody').querySelector('#detailUpdateStatus').addEventListener('click',()=>{closeModal('formModal');openOrderStatusForm(o);});openModal('formModal');}
function openOrderStatusForm(o){const statusOpts=['new','confirmed','preparing','ready','delivered','cancelled'];showFormModal('Ubah status pesanan',`<form class="admin-form" data-admin-form><div class="inline-stat">${escapeHtml(o.orderCode||o.id)} · ${money(o.total)}<br>Pelanggan: <b>${escapeHtml(o.customer?.name||o.customerName||'—')}</b></div><label>Status pesanan<select name="status">${statusOpts.map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${escapeHtml(statusLabel(s))}</option>`).join('')}</select></label><label>Status pembayaran<select name="paymentStatus"><option value="unpaid" ${(o.paymentStatus||'unpaid')==='unpaid'?'selected':''}>Belum dibayar</option><option value="paid" ${o.paymentStatus==='paid'?'selected':''}>Sudah dibayar (verifikasi manual)</option><option value="refunded" ${o.paymentStatus==='refunded'?'selected':''}>Dikembalikan</option></select></label><label>Referensi pembayaran / catatan internal<input name="paymentReference" maxlength="160" value="${escapeHtml(o.paymentReference||'')}" placeholder="Contoh: transfer, referensi bank…"></label><label>Catatan status<textarea name="adminNote" rows="2" maxlength="500">${escapeHtml(o.adminNote||'')}</textarea></label><div class="admin-form-note">Pada paket gratis, transaksi dikelola langsung melalui Firestore. Harga modal dan harga jual dikunci sebagai snapshot saat pesanan dikonfirmasi. Verifikasi transfer manual sebelum menandai lunas.</div><div class="admin-form-actions"><button type="button" class="btn btn-ghost" data-close="formModal">Batal</button><button type="submit" class="btn btn-primary">Simpan status</button></div></form>`,async form=>{
 const status=getVal(form,'status'),paymentStatus=getVal(form,'paymentStatus'),paymentReference=getVal(form,'paymentReference'),adminNote=getVal(form,'adminNote');
 if(status==='delivered'&&paymentStatus!=='paid')throw new Error('Konfirmasi pembayaran pelanggan terlebih dahulu sebelum menandai pesanan terkirim.');
 if(status==='cancelled'&&o.paymentStatus==='paid'&&paymentStatus!=='refunded')throw new Error('Pesanan sudah dibayar pelanggan. Lakukan refund terlebih dahulu dan pilih status pembayaran dikembalikan.');
 if(status==='cancelled'&&o.items?.some(i=>i.settlementStatus==='paid'))throw new Error('Sebagian pembayaran ke mitra sudah tercatat; pesanan tidak dapat dibatalkan melalui dashboard ini.');
 if(!IS_DEMO&&!o.stockReserved&&!['new','confirmed','cancelled'].includes(status))throw new Error('Konfirmasi pesanan terlebih dahulu untuk memverifikasi harga dan mencadangkan stok.');
 if(!IS_DEMO&&!o.stockReserved&&paymentStatus==='paid'&&status!=='confirmed')throw new Error('Konfirmasi pesanan terlebih dahulu sebelum menandai pembayaran sudah diterima.');
 setBusy(true,'Memperbarui pesanan…');try{
  if(IS_DEMO){const sim=getSimulationState(),order=sim.orders.find(x=>x.id===o.id);if(!order)throw new Error('Pesanan tidak ditemukan di data simulasi.');if(status==='cancelled'&&!order.stockRestored&&order.stockReserved){(order.items||[]).forEach(item=>{const product=sim.products.find(p=>p.id===item.productId);if(product)product.stock=Number(product.stock||0)+Number(item.qty||0);});order.stockRestored=true;}order.status=status;order.paymentStatus=paymentStatus;order.paymentReference=paymentReference;order.adminNote=adminNote;order.updatedAt=localStamp();persistSimulation();closeModal('formModal');showToast('Status pesanan diperbarui di simulasi.');await refreshAdminData();await loadCatalog();return;}
  const orderRef=doc(db,'orders',o.id);
  await runTransaction(db,async tx=>{
   const orderSnap=await tx.get(orderRef);if(!orderSnap.exists())throw new Error('Pesanan tidak ditemukan.');const current=orderSnap.data();
   if(current.status==='cancelled'&&status!=='cancelled')throw new Error('Pesanan yang dibatalkan tidak dapat diaktifkan kembali.');
   if(current.status==='delivered'&&status==='cancelled')throw new Error('Pesanan yang sudah terkirim tidak dapat dibatalkan dari dashboard.');
   if(status==='delivered'&&paymentStatus!=='paid')throw new Error('Pesanan harus sudah dibayar sebelum ditandai terkirim.');
   if(status==='cancelled'&&current.paymentStatus==='paid'&&paymentStatus!=='refunded')throw new Error('Pembayaran pelanggan harus ditandai dikembalikan sebelum pembatalan.');
   const currentItems=Array.isArray(current.items)?current.items:[];
   if(status==='cancelled'&&currentItems.some(i=>i.settlementStatus==='paid'))throw new Error('Pembayaran mitra sudah tercatat untuk pesanan ini.');
   const reserve=(status==='confirmed'&&!current.stockReserved);const restore=(status==='cancelled'&&current.stockReserved&&!current.stockRestored);
   if(reserve&&current.paymentStatus==='refunded')throw new Error('Pesanan dengan refund tidak dapat dikonfirmasi.');
   let nextItems=currentItems.map(i=>({...i}));let nextTotal=Number(current.total||0),nextPartnerCost=Number(current.partnerCostTotal||0),nextMargin=Number(current.platformMargin||0),nextItemCount=Number(current.itemCount||currentItems.reduce((n,i)=>n+Number(i.qty||0),0));
   let nextStockReserved=Boolean(current.stockReserved),nextStockRestored=Boolean(current.stockRestored),nextAssignedPartnerIds=Array.isArray(current.assignedPartnerIds)?current.assignedPartnerIds:[];
   const productIds=[...new Set(currentItems.map(i=>String(i.productId||'')).filter(Boolean))];
   if((reserve||restore)&&!productIds.length)throw new Error('Pesanan tidak memiliki rincian menu.');
   const refs=productIds.map(id=>({id,productRef:doc(db,'products',id),catalogRef:doc(db,'catalog',id)}));
   const reads=(reserve||restore)?await Promise.all(refs.flatMap(r=>[tx.get(r.productRef),tx.get(r.catalogRef)])):[];
   const stockRows=refs.map((r,index)=>({...r,productSnap:reads[index*2],catalogSnap:reads[index*2+1]}));
   const stockById=Object.fromEntries(stockRows.map(r=>[r.id,r]));
   if(reserve){
    const partnerIds=[...new Set(currentItems.map(i=>{const p=stockById[String(i.productId)]?.productSnap;return p?.exists()?p.data().partnerId:'';}).filter(Boolean))];
    const partnerRefs=partnerIds.map(id=>({id,ref:doc(db,'partners',id)}));const partnerSnaps=await Promise.all(partnerRefs.map(r=>tx.get(r.ref)));const partnerStatus=Object.fromEntries(partnerRefs.map((r,index)=>[r.id,partnerSnaps[index].exists()?partnerSnaps[index].data().status:'missing']));
    const aggregated=new Map();currentItems.forEach(i=>{const id=String(i.productId||'');const qty=Number(i.qty||0);if(!id||!Number.isInteger(qty)||qty<1)throw new Error('Rincian jumlah menu tidak valid.');aggregated.set(id,(aggregated.get(id)||0)+qty);});
    nextItems=[];let total=0,partnerCost=0;
    for(const [id,qty] of aggregated){const stock=stockById[id];if(!stock||!stock.productSnap.exists()||!stock.catalogSnap.exists())throw new Error(`Menu ${id} tidak ditemukan. Muat ulang data menu.`);const p=stock.productSnap.data(),c=stock.catalogSnap.data();if(p.status!=='active'||c.status!=='active')throw new Error(`Menu ${c.name||p.name||id} sedang nonaktif.`);const partnerId=p.partnerId;if(!partnerId||partnerStatus[partnerId]!=='active')throw new Error(`Mitra untuk ${c.name||p.name||id} belum aktif.`);const available=Math.min(Number(p.stock||0),Number(c.stock||0));if(available<qty)throw new Error(`Stok ${c.name||p.name||id} tidak cukup. Tersedia ${available} box.`);const unitPrice=Number(c.salePrice??p.salePrice??0),costPrice=Number(p.costPrice??0);if(!Number.isSafeInteger(unitPrice)||!Number.isSafeInteger(costPrice)||unitPrice<=0||costPrice<0||unitPrice<costPrice)throw new Error(`Harga menu ${c.name||p.name||id} belum valid.`);const partnerName=partnerRefs.length? (partnerRefs.find(r=>r.id===partnerId)?.id===partnerId?partnerSnaps[partnerIds.indexOf(partnerId)].data().name:'Mitra BoxKita'):'Mitra BoxKita';const lineTotal=unitPrice*qty,partnerCostTotal=costPrice*qty,platformMargin=lineTotal-partnerCostTotal;nextItems.push({productId:id,name:c.name||p.name||`Menu ${id}`,partnerId,partnerName,qty,unitPrice,costPrice,lineTotal,partnerCostTotal,platformMargin,settlementStatus:'pending'});total+=lineTotal;partnerCost+=partnerCostTotal;tx.update(stock.productRef,{stock:available-qty,updatedAt:serverTimestamp()});tx.update(stock.catalogRef,{stock:available-qty,updatedAt:serverTimestamp()});}
    nextTotal=total;nextPartnerCost=partnerCost;nextMargin=total-partnerCost;nextItemCount=nextItems.reduce((n,i)=>n+i.qty,0);nextStockReserved=true;nextStockRestored=false;nextAssignedPartnerIds=[...new Set(nextItems.map(i=>i.partnerId).filter(Boolean))];
   } else if(restore){
    for(const stock of stockRows){if(!stock.productSnap.exists()||!stock.catalogSnap.exists())continue;const qty=currentItems.filter(i=>String(i.productId)===stock.id).reduce((n,i)=>n+Number(i.qty||0),0);tx.update(stock.productRef,{stock:Number(stock.productSnap.get('stock')||0)+qty,updatedAt:serverTimestamp()});tx.update(stock.catalogRef,{stock:Number(stock.catalogSnap.get('stock')||0)+qty,updatedAt:serverTimestamp()});}
    nextStockRestored=true;
   }
   const patch={status,paymentStatus,paymentReference,adminNote,updatedAt:serverTimestamp(),lastUpdatedBy:currentAdmin.uid,stockReserved:nextStockReserved,stockRestored:nextStockRestored,assignedPartnerIds:nextAssignedPartnerIds};
   if(reserve){Object.assign(patch,{items:nextItems,total:nextTotal,partnerCostTotal:nextPartnerCost,partnerPayoutTotal:nextPartnerCost,platformMargin:nextMargin,itemCount:nextItemCount});}
   else if(current.total!==undefined){Object.assign(patch,{total:nextTotal,partnerCostTotal:nextPartnerCost,partnerPayoutTotal:Number(current.partnerPayoutTotal??nextPartnerCost),platformMargin:nextMargin,itemCount:nextItemCount});}
   if(reserve){
    if(current.customerUid){const customerViewRef=doc(db,'customerOrderViews',current.customerUid,'orders',o.id);tx.set(customerViewRef,{orderId:o.id,orderCode:current.orderCode||o.id,customerUid:current.customerUid,customer:{name:current.customer?.name||'',phone:current.customer?.phone||'',deliveryDate:current.customer?.deliveryDate||current.deliveryDate||'',deliveryArea:current.customer?.deliveryArea||'',address:current.customer?.address||'',notes:current.customer?.notes||current.notes||''},items:nextItems.map(i=>({productId:i.productId,name:i.name,qty:i.qty,unitPrice:i.unitPrice,lineTotal:i.lineTotal})),itemCount:nextItemCount,total:nextTotal,status,paymentStatus,deliveryDate:current.deliveryDate||current.customer?.deliveryDate||'',createdAt:current.createdAt||serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});}
    for(const partnerId of nextAssignedPartnerIds){const partnerItems=nextItems.filter(i=>i.partnerId===partnerId);const partnerOrderRef=doc(db,'partnerOrderViews',partnerId,'orders',o.id);tx.set(partnerOrderRef,{orderId:o.id,orderCode:current.orderCode||o.id,partnerId,partnerName:partnerItems[0]?.partnerName||'Mitra BoxKita',items:partnerItems.map(i=>({productId:i.productId,name:i.name,qty:i.qty})),partnerCostTotal:partnerItems.reduce((sum,i)=>sum+Number(i.partnerCostTotal||0),0),customer:{name:current.customer?.name||'',phone:current.customer?.phone||'',deliveryDate:current.customer?.deliveryDate||current.deliveryDate||'',deliveryArea:current.customer?.deliveryArea||'',address:current.customer?.address||'',notes:current.customer?.notes||current.notes||''},status,paymentStatus,deliveryDate:current.deliveryDate||current.customer?.deliveryDate||'',createdAt:current.createdAt||serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});}
   } else {
    if(current.customerUid){const customerViewRef=doc(db,'customerOrderViews',current.customerUid,'orders',o.id);tx.set(customerViewRef,{status,paymentStatus,deliveryDate:current.deliveryDate||current.customer?.deliveryDate||'',updatedAt:serverTimestamp()},{merge:true});}
    for(const partnerId of nextAssignedPartnerIds){const partnerOrderRef=doc(db,'partnerOrderViews',partnerId,'orders',o.id);tx.set(partnerOrderRef,{status,paymentStatus,deliveryDate:current.deliveryDate||current.customer?.deliveryDate||'',updatedAt:serverTimestamp()},{merge:true});}
   }
   tx.update(orderRef,patch);
  });
  closeModal('formModal');showToast('Status pesanan diperbarui di Firestore (paket gratis).');await refreshAdminData();await loadCatalog();
 }finally{setBusy(false);}},'OPERASIONAL PESANAN');openModal('formModal');}
async function toggleProduct(p){const status=p.status==='active'?'paused':'active';if(!confirm(`${status==='active'?'Aktifkan':'Nonaktifkan'} menu “${p.name}”?`))return;setBusy(true,'Memperbarui katalog…');try{if(IS_DEMO){const sim=getSimulationState(),item=sim.products.find(x=>x.id===p.id);if(item){item.status=status;item.updatedAt=localStamp();persistSimulation();}showToast('Status menu diperbarui di simulasi.');await refreshAdminData();await loadCatalog();return;}const batch=writeBatch(db);batch.update(doc(db,'products',p.id),{status,updatedAt:serverTimestamp()});batch.update(doc(db,'catalog',p.id),{status,updatedAt:serverTimestamp()});await batch.commit();showToast('Status menu diperbarui.');await refreshAdminData();await loadCatalog();}catch(error){showToast(error.message||'Gagal mengubah status menu.');}finally{setBusy(false);}}
async function togglePartner(p){const status=p.status==='active'?'paused':'active';if(!confirm(`${status==='active'?'Aktifkan':'Nonaktifkan'} mitra “${p.name}”?`))return;try{setBusy(true,'Memperbarui data mitra…');if(IS_DEMO){const sim=getSimulationState(),partner=sim.partners.find(x=>x.id===p.id);if(partner){partner.status=status;partner.updatedAt=localStamp();sim.products.filter(x=>x.partnerId===p.id).forEach(x=>{x.status=status;x.updatedAt=localStamp();});persistSimulation();}showToast('Status mitra dan menunya diperbarui di simulasi.');await refreshAdminData();await loadCatalog();return;}const catalogRows=(window.adminCatalogCache||[]).filter(x=>x.partnerId===p.id);const batch=writeBatch(db);batch.update(doc(db,'partners',p.id),{status,updatedAt:serverTimestamp()});batch.set(doc(db,'partnerDirectory',p.id),{name:p.name,area:normalizeArea(p.area||'Semua wilayah'),specialty:p.specialty||'',status,updatedAt:serverTimestamp()},{merge:true});catalogRows.forEach(c=>{batch.update(doc(db,'catalog',c.id),{status:status==='active'?'active':'paused',updatedAt:serverTimestamp()});batch.update(doc(db,'products',c.id),{status:status==='active'?'active':'paused',updatedAt:serverTimestamp()});});await batch.commit();showToast('Status mitra dan menunya diperbarui.');await refreshAdminData();await loadCatalog();}catch(error){console.error(error);showToast(error.message||'Gagal memperbarui mitra.');}finally{setBusy(false);}}
async function approveApplication(a){if(!confirm(`Setujui ${a.businessName||a.name} sebagai mitra?`))return;setBusy(true,'Menyetujui mitra…');try{if(IS_DEMO){const sim=getSimulationState(),partnerId=simulationId('MITRA'),newPartner={id:partnerId,name:a.businessName||a.name,contactName:a.contactName||'',phone:a.phone||'',area:normalizeArea(a.area||'Semua wilayah'),capacity:a.capacity||'',specialty:a.specialty||'',notes:a.notes||'',bankName:'',bankAccountName:'',bankAccountNo:'',status:'active',createdAt:localStamp(),updatedAt:localStamp(),applicationId:a.id};sim.partners.push(newPartner);const application=sim.applications.find(x=>x.id===a.id);if(application){application.status='approved';application.reviewedAt=localStamp();application.reviewedBy=currentAdmin.uid;}persistSimulation();showToast('Pendaftar disetujui dan masuk daftar mitra simulasi.');await refreshAdminData();await loadCatalog();return;}const partnerId=doc(collection(db,'partners')).id;const data={name:a.businessName||a.name,contactName:a.contactName||'',phone:a.phone||'',area:normalizeArea(a.area||'Jakarta'),capacity:a.capacity||'',specialty:a.specialty||'',notes:a.notes||'',bankName:'',bankAccountName:'',bankAccountNo:'',status:'active',uid:a.uid||'',createdAt:serverTimestamp(),updatedAt:serverTimestamp(),applicationId:a.id};const batch=writeBatch(db);batch.set(doc(db,'partners',partnerId),data);batch.set(doc(db,'partnerDirectory',partnerId),{name:data.name,area:data.area,specialty:data.specialty,status:'active',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});batch.update(doc(db,'partnerApplications',a.id),{status:'approved',reviewedAt:serverTimestamp(),reviewedBy:currentAdmin.uid,partnerId});if(a.uid){batch.update(doc(db,'users',a.uid),{role:'partner',active:true,partnerId,partnerName:data.name,updatedAt:serverTimestamp()});}await batch.commit();showToast(a.uid?'Mitra disetujui. Akun tersebut sekarang dapat membuka Dashboard Mitra.':'Mitra disetujui. Belum ada akun login yang ditautkan untuk mitra ini.');await refreshAdminData();}catch(error){console.error(error);showToast(error.message||'Pendaftar belum berhasil disetujui.');}finally{setBusy(false);}}
async function rejectApplication(a){const note=prompt('Catatan penolakan (opsional):','');if(note===null)return;try{if(IS_DEMO){const sim=getSimulationState(),application=sim.applications.find(x=>x.id===a.id);if(application){application.status='rejected';application.reviewNote=note;application.reviewedAt=localStamp();application.reviewedBy=currentAdmin.uid;}persistSimulation();showToast('Pendaftaran ditandai ditolak di simulasi.');await refreshAdminData();return;}await updateDoc(doc(db,'partnerApplications',a.id),{status:'rejected',reviewNote:note,reviewedAt:serverTimestamp(),reviewedBy:currentAdmin.uid});showToast('Pendaftaran ditandai ditolak.');await refreshAdminData();}catch(error){showToast(error.message||'Gagal memperbarui pendaftaran.');}}
async function startSettlement(partnerId){const eligible=orders.filter(o=>o.paymentStatus==='paid'&&o.status==='delivered'&&(o.items||[]).some(i=>(i.partnerId||o.partnerId)===partnerId&&i.settlementStatus!=='paid'));if(!eligible.length)return showToast('Tidak ada pesanan yang memenuhi syarat pembayaran.');const partner=partners.find(p=>p.id===partnerId);const ids=eligible.slice(0,100).map(o=>o.id);const expected=eligible.slice(0,100).reduce((sum,o)=>sum+(o.items||[]).filter(i=>(i.partnerId||o.partnerId)===partnerId&&i.settlementStatus!=='paid').reduce((s,i)=>s+Number(i.partnerCostTotal??Number(i.costPrice||0)*Number(i.qty||0)),0),0);const orderCodes=eligible.slice(0,100).map(o=>o.orderCode||o.id);showFormModal('Catat pembayaran mitra',`<form class="admin-form" data-admin-form><div class="inline-stat">Mitra: <b>${escapeHtml(partner?.name||'Mitra')}</b><br>Pesanan tercakup: <b>${ids.length}</b><br>${escapeHtml(orderCodes.join(', '))}</div><div class="inline-stat">Nominal yang dihitung dari snapshot pesanan: <b>${money(expected)}</b><br>Periksa kembali bukti transfer sebelum menyimpan.</div><label>Metode pembayaran<select name="method" required><option>Transfer bank</option><option>E-wallet</option><option>Tunai</option><option>Lainnya</option></select></label><label>Referensi transaksi<input name="reference" required maxlength="160" placeholder="Nomor referensi / bukti internal"></label><label>Catatan pembayaran<textarea name="notes" rows="2" maxlength="400" placeholder="Periode pembayaran, catatan tambahan…"></textarea></label><div class="admin-form-note">Mode Spark: pencatatan dibuat dalam transaksi Firestore oleh akun admin. Pesanan terpilih yang sudah dibayar tidak akan dimasukkan kembali ke pembayaran mitra.</div><div class="admin-form-actions"><button type="button" class="btn btn-ghost" data-close="formModal">Batal</button><button type="submit" class="btn btn-primary">Konfirmasi pembayaran</button></div></form>`,async form=>{const reference=getVal(form,'reference');if(!reference)throw new Error('Isi referensi pembayaran.');setBusy(true,'Memvalidasi dan mencatat pembayaran…');try{
 if(IS_DEMO){const sim=getSimulationState(),method=getVal(form,'method'),notes=getVal(form,'notes'),targetOrders=sim.orders.filter(o=>ids.includes(o.id));if(targetOrders.some(o=>o.paymentStatus!=='paid'||o.status!=='delivered'))throw new Error('Hanya pesanan terkirim dan sudah dibayar yang dapat masuk simulasi pembayaran mitra.');let amount=0;targetOrders.forEach(order=>{(order.items||[]).forEach(item=>{if((item.partnerId||order.partnerId)===partnerId&&item.settlementStatus!=='paid'){amount+=Number(item.partnerCostTotal??Number(item.costPrice||0)*Number(item.qty||0));item.settlementStatus='paid';}});order.settlementStatus=(order.items||[]).every(i=>i.settlementStatus==='paid')?'paid':'partial';order.updatedAt=localStamp();});const partner=sim.partners.find(p=>p.id===partnerId);sim.settlements.unshift({id:simulationId('BAYAR'),settlementCode:simulationId('SET'),partnerId,partnerName:partner?.name||'Mitra',amount,method:getVal(form,'method'),reference,notes,orderIds:targetOrders.map(o=>o.id),orderCodes:targetOrders.map(o=>o.orderCode||o.id),createdAt:localStamp(),simulation:true});persistSimulation();closeModal('formModal');showToast('Pembayaran mitra dicatat di simulasi.');await refreshAdminData();return;}
 const method=getVal(form,'method'),notes=getVal(form,'notes'),partnerRef=doc(db,'partners',partnerId),settlementRef=doc(collection(db,'settlements')),settlementCode=createCode('SET');
 await runTransaction(db,async tx=>{const partnerSnap=await tx.get(partnerRef);if(!partnerSnap.exists())throw new Error('Data mitra tidak ditemukan.');const orderRefs=ids.map(id=>({id,ref:doc(db,'orders',id)}));const snaps=await Promise.all(orderRefs.map(r=>tx.get(r.ref)));let amount=0,units=0;const changes=[];
  for(let idx=0;idx<orderRefs.length;idx++){const snap=snaps[idx];if(!snap.exists())throw new Error(`Pesanan ${orderRefs[idx].id} tidak ditemukan.`);const order=snap.data();if(order.status!=='delivered'||order.paymentStatus!=='paid')throw new Error(`Pesanan ${order.orderCode||orderRefs[idx].id} harus terkirim dan sudah dibayar.`);const items=Array.isArray(order.items)?order.items:[];const matching=items.filter(i=>i.partnerId===partnerId);if(!matching.length)throw new Error(`Pesanan ${order.orderCode||orderRefs[idx].id} tidak memiliki item dari mitra ini.`);if(matching.some(i=>i.settlementStatus==='paid'))throw new Error(`Pesanan ${order.orderCode||orderRefs[idx].id} sudah masuk pembayaran mitra. Muat ulang rekap.`);const due=matching.reduce((sum,i)=>sum+Number(i.partnerCostTotal??Number(i.costPrice||0)*Number(i.qty||0)),0);if(!Number.isSafeInteger(due)||due<=0)throw new Error('Nominal pembayaran mitra tidak valid.');amount+=due;units+=matching.reduce((sum,i)=>sum+Number(i.qty||0),0);const updatedItems=items.map(i=>i.partnerId===partnerId?{...i,settlementStatus:'paid',settlementId:settlementRef.id,settlementCode}:i);changes.push({ref:orderRefs[idx].ref,updatedItems,allPaid:updatedItems.every(i=>i.settlementStatus==='paid'),orderCode:order.orderCode||orderRefs[idx].id});}
  if(!Number.isSafeInteger(amount)||amount<=0)throw new Error('Total pembayaran tidak valid.');for(const change of changes)tx.update(change.ref,{items:change.updatedItems,settlementStatus:change.allPaid?'paid':'pending',updatedAt:serverTimestamp()});tx.set(settlementRef,{settlementCode,partnerId,partnerName:partnerSnap.data().name||partner?.name||'Mitra',amount,units,orderIds:changes.map(c=>c.ref.id),orderCodes:changes.map(c=>c.orderCode),method,reference,notes,status:'paid',createdAt:serverTimestamp(),createdBy:currentAdmin.uid});
 });closeModal('formModal');showToast('Pembayaran mitra berhasil dicatat di Firestore.');await refreshAdminData();
 }finally{setBusy(false);}},'PENYELESAIAN MITRA');openModal('formModal');}

// Initial customer experience and PWA cache registration.
const deliveryDateInput=byId('checkoutForm').elements.deliveryDate; if(deliveryDateInput){const today=new Date();deliveryDateInput.min=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;}
await loadCatalog();
setNavigationRole(currentRole);
// Admin login is intentionally not shown to public users. Owner opens /?portal=admin when needed.
if(new URLSearchParams(location.search).get('portal')==='admin'||location.hash==='#pengelola')setTimeout(openAdminEntry,180);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(err=>console.warn('Service worker unavailable',err)));
})().catch(error=>{
  console.error('BoxKita gagal dijalankan:', error);
  const message = 'Aplikasi belum selesai dimuat. Coba muat ulang halaman. Jika dibuka dari file ZIP, pastikan file app.js satu folder dengan index.html. Detail: ' + (error?.message || error);
  const toast = document.getElementById('toast');
  if (toast) { toast.textContent = message; toast.classList.add('show'); }
  ['accountOpenBtn','mobileAccountBtn','adminDashboardEntry'].forEach(id=>{
    const button=document.getElementById(id);
    if(button) button.addEventListener('click',()=>window.alert(message));
  });
});
