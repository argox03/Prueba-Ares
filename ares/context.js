import {search,compare,norm} from './search.js';
export function buildContext(snapshot,question,previous={codes:[],quantity:null}) {
 const q=norm(question);
 let result=search(snapshot.productos,question);
 // Remove conversational scaffolding but preserve dimensions and identifying terms.
 if(!result.total){const clean=q.replace(/\b(si|hola|ares|por favor|puedes|podrias|ayudame|saber|quisiera|necesito|quiero|donde|comprarlo|mejor|barato|comprar|compramos|nos|sale|saldria|costaria|seria|cuanto|cuantos|cuantas|cual|son|es|esta|estas|estos|este|ese|esa|tienen|tienes|tenemos|venden|vendes|dime|sobre|del|de|las|los|la|el|unas|unos|una|un|en|y|a|para)\b/g,' ').replace(/\b\d+\s*(unidades?|piezas?)\b/g,' ');result=search(snapshot.productos,clean);}
 // Reuse product selection only for explicit follow-ups, never for an unknown new code.
 const follow=/^(y\b|¿?y\b)|\b(ese|esa|esos|esas|este|esta|estos|estas|el mismo|la misma|anterior|de ellos|de ellas|comprarlos|comprarlo)\b/.test(q)||/^(necesito|quiero|serian|para)\s+\d+\s*(unidades?|piezas?)\b/.test(q);
 const unknownCode=/\b[a-z]{2,}[a-z_-]*\d+[a-z0-9_-]*\b/.test(q)&&!result.total;
 let products=result.items.slice(0,6),fromPrevious=false;
 if(!result.total&&follow&&!unknownCode){const set=new Set(previous.codes);products=snapshot.productos.filter(p=>set.has(p.codigo)).slice(0,6);fromPrevious=products.length>0;}
 const explicit=q.match(/\b(?:necesito|quiero|comprar|para|serian)\s+(\d{1,6})(?:\s+(?:unidades?|piezas?)\b|(?=\s+(?:de|del|para)\b)|(?=\s*[?.!]*$))/ )||q.match(/\b(\d{1,6})\s*(?:unidades?|piezas?)\b/);
 const newProduct=!fromPrevious&&products.some(p=>!previous.codes.includes(p.codigo));
 const quantity=explicit&&+explicit[1]>0&&+explicit[1]<=100000?+explicit[1]:newProduct?null:previous.quantity??null;
 const ofertas=snapshot.admin?products.flatMap(p=>{
   const usd=compare(snapshot.ofertas,p.codigo,'usd',quantity||1);
   const bs=compare(snapshot.ofertas,p.codigo,'bs',quantity||1);
   return usd.slice(0,8).map(o=>{const b=bs.find(x=>x.codigoProveedor===o.codigoProveedor&&x.proveedor===o.proveedor&&x.lista===o.lista);return {codigo:p.codigo,proveedor:o.proveedor,codigoProveedor:o.codigoProveedor,presentacion:o.presentacion,unidadesPorEmpaque:o.unidades,fecha:o.fecha,lista:o.lista,netoUnidadDivisas:o.netoUnidad,netoUnidadPagoBs:b?.netoUnidad??null,unidadesCompra:quantity?o.unidadesCompra:null,totalDivisas:quantity?o.totalCompra:null,totalPagoBs:quantity?b?.totalCompra??null:null}});
 }).slice(0,24):[];
 return {context:{demo:true,actualizado:snapshot.actualizado,productos:products,ofertas,cantidadSolicitada:quantity,consultaParcial:true,coincidenciasBusqueda:result.total,retomaProductoAnterior:fromPrevious,vista:snapshot.admin?'administrador':'vendedor',resumen:{productos:snapshot.productos.length,agotados:snapshot.productos.filter(p=>p.existencia<=0).length,porReponer:snapshot.productos.filter(p=>p.existencia>0&&p.existencia<=p.minimo).length},nota:'Precios netos expresados en USD o equivalente USD para pago en Bs. Sin flete/impuestos no registrados. No hay cantidad asumida si cantidadSolicitada=null. Contexto parcial; pedir código si falta coincidencia.'},state:{codes:products.map(p=>p.codigo),quantity}};
}
