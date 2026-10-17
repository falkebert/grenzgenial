// Adds the missing states to grenzgenial/index.html: outline path (p) and map box (P) from
// Natural Earth 50m (public domain), names/capitals/neighbours from the hand table below.
// Usage: node build/add-countries.mjs [--check CODE,...]   (--check prints rebuilt vs. existing data, writes nothing)
import fs from 'node:fs';

const HTML = new URL('../grenzgenial/index.html', import.meta.url);
const NE_CACHE = new URL('./ne_50m_admin_0_countries.geojson', import.meta.url);
const NE_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';

// n: German name, c: German capital ('' = no capital questions), r: region, b: land neighbours
const NEW = {
  // Afrika
  BJ:{n:'Benin',c:'Porto-Novo',r:'f',b:['TG','BF','NE','NG']},
  BF:{n:'Burkina Faso',c:'Ouagadougou',r:'f',b:['ML','NE','BJ','TG','GH','CI']},
  BI:{n:'Burundi',c:'Gitega',r:'f',b:['RW','TZ','CD']},
  CV:{n:'Kap Verde',c:'Praia',r:'f',b:[]},
  CF:{n:'Zentralafrikanische Republik',c:'Bangui',r:'f',b:['TD','SD','SS','CD','CG','CM']},
  KM:{n:'Komoren',c:'Moroni',r:'f',b:[]},
  CG:{n:'Republik Kongo',c:'Brazzaville',r:'f',b:['GA','CM','CF','CD','AO']},
  DJ:{n:'Dschibuti',c:'Dschibuti',r:'f',b:['ER','ET','SO']},
  GQ:{n:'Äquatorialguinea',c:'Malabo',r:'f',b:['CM','GA']},
  ER:{n:'Eritrea',c:'Asmara',r:'f',b:['SD','ET','DJ']},
  SZ:{n:'Eswatini',c:'Mbabane',r:'f',b:['ZA','MZ']},
  GA:{n:'Gabun',c:'Libreville',r:'f',b:['GQ','CM','CG']},
  GM:{n:'Gambia',c:'Banjul',r:'f',b:['SN']},
  GN:{n:'Guinea',c:'Conakry',r:'f',b:['GW','SN','ML','CI','LR','SL']},
  GW:{n:'Guinea-Bissau',c:'Bissau',r:'f',b:['SN','GN']},
  LS:{n:'Lesotho',c:'Maseru',r:'f',b:['ZA']},
  LR:{n:'Liberia',c:'Monrovia',r:'f',b:['SL','GN','CI']},
  MW:{n:'Malawi',c:'Lilongwe',r:'f',b:['TZ','MZ','ZM']},
  MR:{n:'Mauretanien',c:'Nouakchott',r:'f',b:['DZ','ML','SN']},
  MU:{n:'Mauritius',c:'Port Louis',r:'f',b:[]},
  ST:{n:'São Tomé und Príncipe',c:'São Tomé',r:'f',b:[]},
  SC:{n:'Seychellen',c:'Victoria',r:'f',b:[]},
  SL:{n:'Sierra Leone',c:'Freetown',r:'f',b:['GN','LR']},
  SS:{n:'Südsudan',c:'Juba',r:'f',b:['SD','ET','KE','UG','CD','CF']},
  TG:{n:'Togo',c:'Lomé',r:'f',b:['GH','BF','BJ']},
  // Asien
  BH:{n:'Bahrain',c:'Manama',r:'a',b:[]},
  BT:{n:'Bhutan',c:'Thimphu',r:'a',b:['CN','IN']},
  BN:{n:'Brunei',c:'Bandar Seri Begawan',r:'a',b:['MY']},
  IL:{n:'Israel',c:'',r:'a',b:['LB','SY','JO','EG','PS']},
  KW:{n:'Kuwait',c:'Kuwait-Stadt',r:'a',b:['IQ','SA']},
  MV:{n:'Malediven',c:'Malé',r:'a',b:[]},
  SG:{n:'Singapur',c:'Singapur',r:'a',b:[]},
  LK:{n:'Sri Lanka',c:'Sri Jayewardenepura Kotte',r:'a',b:[]},
  TL:{n:'Osttimor',c:'Dili',r:'a',b:['ID']},
  PS:{n:'Palästina',c:'',r:'a',b:['IL','JO','EG']},
  TW:{n:'Taiwan',c:'Taipeh',r:'a',b:[]},
  // Europa
  AD:{n:'Andorra',c:'Andorra la Vella',r:'e',b:['FR','ES']},
  LI:{n:'Liechtenstein',c:'Vaduz',r:'e',b:['AT','CH']},
  MT:{n:'Malta',c:'Valletta',r:'e',b:[]},
  MC:{n:'Monaco',c:'Monaco',r:'e',b:['FR']},
  SM:{n:'San Marino',c:'San Marino',r:'e',b:['IT']},
  VA:{n:'Vatikanstadt',c:'Vatikanstadt',r:'e',b:['IT']},
  XK:{n:'Kosovo',c:'Pristina',r:'e',b:['AL','MK','ME','RS']},
  // Amerika
  AG:{n:'Antigua und Barbuda',c:"Saint John's",r:'m',b:[]},
  BS:{n:'Bahamas',c:'Nassau',r:'m',b:[]},
  BB:{n:'Barbados',c:'Bridgetown',r:'m',b:[]},
  BZ:{n:'Belize',c:'Belmopan',r:'m',b:['MX','GT']},
  DM:{n:'Dominica',c:'Roseau',r:'m',b:[]},
  DO:{n:'Dominikanische Republik',c:'Santo Domingo',r:'m',b:['HT']},
  SV:{n:'El Salvador',c:'San Salvador',r:'m',b:['GT','HN']},
  GD:{n:'Grenada',c:"St. George's",r:'m',b:[]},
  GT:{n:'Guatemala',c:'Guatemala-Stadt',r:'m',b:['MX','BZ','SV','HN']},
  GY:{n:'Guyana',c:'Georgetown',r:'m',b:['VE','BR','SR']},
  HT:{n:'Haiti',c:'Port-au-Prince',r:'m',b:['DO']},
  HN:{n:'Honduras',c:'Tegucigalpa',r:'m',b:['GT','SV','NI']},
  NI:{n:'Nicaragua',c:'Managua',r:'m',b:['HN','CR']},
  KN:{n:'St. Kitts und Nevis',c:'Basseterre',r:'m',b:[]},
  LC:{n:'St. Lucia',c:'Castries',r:'m',b:[]},
  VC:{n:'St. Vincent und die Grenadinen',c:'Kingstown',r:'m',b:[]},
  SR:{n:'Suriname',c:'Paramaribo',r:'m',b:['GY','BR']},
  TT:{n:'Trinidad und Tobago',c:'Port of Spain',r:'m',b:[]},
  // Ozeanien
  KI:{n:'Kiribati',c:'Süd-Tarawa',r:'o',b:[]},
  MH:{n:'Marshallinseln',c:'Majuro',r:'o',b:[]},
  FM:{n:'Mikronesien',c:'Palikir',r:'o',b:[]},
  NR:{n:'Nauru',c:'Yaren',r:'o',b:[]},
  PW:{n:'Palau',c:'Ngerulmud',r:'o',b:[]},
  WS:{n:'Samoa',c:'Apia',r:'o',b:[]},
  SB:{n:'Salomonen',c:'Honiara',r:'o',b:[]},
  TO:{n:'Tonga',c:'Nukuʻalofa',r:'o',b:[]},
  TV:{n:'Tuvalu',c:'Funafuti',r:'o',b:[]},
  VU:{n:'Vanuatu',c:'Port Vila',r:'o',b:[]},
};
// archipelagos whose main group is spread wider than the default keep-radius (degrees)
const RADIUS = {BS:6, MV:5, MH:6, FM:6, SB:7, VU:5, TO:4, CV:3, KM:2, SC:2, KI:4, TV:4, PW:2, ST:2, AG:1, KN:1, VC:1.5, GD:1.5};
// show the group around the capital instead of the largest island ([lon, lat])
const ANCHOR = {KI:[173.0,1.4]};

const merc = lat => Math.log(Math.tan(Math.PI/4 + lat*Math.PI/360)) * 180/Math.PI;
const r2 = x => Math.round(x*100)/100;

async function loadNE(){
  if(!fs.existsSync(NE_CACHE)) fs.writeFileSync(NE_CACHE, await (await fetch(NE_URL)).text());
  return JSON.parse(fs.readFileSync(NE_CACHE,'utf8'));
}
function feature(ne, code){ // several NE features can share an ISO code (AU: Ashmore & Cartier): take the most populous
  const fs_ = ne.features.filter(f=>f.properties.ISO_A2_EH===code);
  if(!fs_.length) throw new Error('no Natural Earth feature for '+code);
  return fs_.sort((a,b)=>b.properties.POP_EST-a.properties.POP_EST)[0];
}
const ringArea = r => { let a=0; for(let i=0,j=r.length-1;i<r.length;j=i++) a+=(r[j][0]+r[i][0])*(r[j][1]-r[i][1]); return Math.abs(a/2) };
const bbox = rings => { let b=[1e9,1e9,-1e9,-1e9]; for(const r of rings)for(const [x,y] of r)b=[Math.min(b[0],x),Math.min(b[1],y),Math.max(b[2],x),Math.max(b[3],y)]; return b };

export function build(f, code){
  const pr=f.properties, gm=f.geometry, lx=ANCHOR[code]?ANCHOR[code][0]:pr.LABEL_X;
  const polys=(gm.type==='Polygon'?[gm.coordinates]:gm.coordinates).map(poly=>{
    const mean=poly[0].reduce((a,p)=>a+p[0],0)/poly[0].length, dx=mean-lx>180?-360:mean-lx<-180?360:0; // unwrap across the date line
    return poly.map(ring=>ring.map(([lon,lat])=>[lon+dx,-merc(lat)]));
  });
  // keep the main polygon plus everything near it (drops Alaska, Svalbard, the Canaries, Galápagos ...)
  const trueArea=p=>{const b=bbox([p[0]]), lat=Math.atan(Math.sinh(-(b[1]+b[3])/2*Math.PI/180)); return ringArea(p[0])*Math.cos(lat)**2}; // undo Mercator inflation (Alaska!)
  const A=ANCHOR[code], dist=p=>{const b=bbox([p[0]]);return Math.hypot((b[0]+b[2])/2-A[0],(b[1]+b[3])/2+merc(A[1]))};
  const main=A?polys.reduce((m,p)=>dist(p)<dist(m)?p:m):polys.reduce((m,p)=>trueArea(p)>trueArea(m)?p:m);
  const mb=bbox([main[0]]), size=Math.max(mb[2]-mb[0],mb[3]-mb[1]);
  const R=RADIUS[code]??Math.max(3,size*.2);
  const gap=b=>Math.max(0,mb[0]-b[2],b[0]-mb[2])+Math.max(0,mb[1]-b[3],b[1]-mb[3]);
  const kept=polys.filter(p=>p===main||gap(bbox([p[0]]))<=R);
  const rings=kept.flat(), [x0,y0,x1,y1]=bbox(rings), w=x1-x0, h=y1-y0;
  const s=540/Math.max(w,h), ow=Math.round(w*s), oh=Math.round(h*s), ox=Math.round((600-ow)/2), oy=Math.round((600-oh)/2);
  let d='';
  for(const ring of rings){
    const pts=[]; for(const [x,y] of ring){const q=[Math.round(ox+(x-x0)*s),Math.round(oy+(y-y0)*s)]; const l=pts[pts.length-1]; if(!l||l[0]!==q[0]||l[1]!==q[1])pts.push(q)}
    while(pts.length>1&&pts[0][0]===pts[pts.length-1][0]&&pts[0][1]===pts[pts.length-1][1])pts.pop();
    if(pts.length<3)continue;
    d+='M'+pts.map(p=>p.join(',')).join('L')+'Z';
  }
  let ly=A?A[1]:pr.LABEL_Y, lxx=A?A[0]:lx; if(lxx<x0-180)lxx+=360;
  return {p:d, P:[r2(x0),r2(y0),r2(w),r2(h),ox,oy,ow,oh,r2(lxx),r2(-merc(ly))], kept:kept.length, total:polys.length};
}

function readData(html){
  const D=JSON.parse(html.match(/const D=(\{.*?\});\n/s)[1]);
  const P=Function('return '+html.match(/const P=(\{.*?\});/s)[1])();
  return {D,P};
}

const ne=await loadNE();
let html=fs.readFileSync(HTML,'utf8');
const {D,P}=readData(html);
const ci=process.argv.indexOf('--check');
if(ci>0){
  for(const c of process.argv[ci+1].split(',')){
    const b=build(feature(ne,c),c), old=D[c];
    console.log(c, 'kept',b.kept+'/'+b.total, 'rings',(b.p.match(/M/g)||[]).length, old?'old rings '+(old.p.match(/M/g)||[]).length:'', '\n  P new',JSON.stringify(b.P), '\n  P old',JSON.stringify(P[c]||null), old?'\n  same path: '+(b.p===old.p)+' len '+b.p.length+' vs '+old.p.length:'');
  }
  process.exit(0);
}

for(const [c,v] of Object.entries(NEW)){
  if(D[c])continue;
  const b=build(feature(ne,c),c);
  D[c]={n:v.n,c:v.c,r:v.r,b:[...v.b],p:b.p}; P[c]=b.P;
}
for(const c in D)for(const x of D[c].b){ // borders are mutual
  if(!D[x])throw new Error(`${c} borders unknown ${x}`);
  if(!D[x].b.includes(c))D[x].b.push(c);
}
const Pstr='{'+Object.entries(P).map(([k,v])=>`${k}:[${v.join(',')}]`).join(',')+'}';
html=html.replace(/const D=\{.*?\};\n/s,()=>'const D='+JSON.stringify(D)+';\n').replace(/const P=\{.*?\};/s,()=>'const P='+Pstr+';');
fs.writeFileSync(HTML,html);
console.log('countries',Object.keys(D).length,'map boxes',Object.keys(P).length);
