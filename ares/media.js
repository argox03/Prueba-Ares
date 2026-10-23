// Preparación local: una foto, sin subir el original ni sus metadatos EXIF.
export const MAX_IMAGE_BYTES=1000000;
export async function preparePhoto(file){
 if(!file||!file.size)throw Error('Selecciona una foto que no esté vacía.');
 if(file.size>20*1024*1024)throw Error('La foto supera 20 MB. Elige una más pequeña.');
 if(!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type))throw Error('Elige una foto JPG, PNG o WebP. Si usas HEIC, conviértela a JPG si tu navegador no la abre.');
 let source,url;
 try{
  // El decodificador aplica la orientación de la cámara; canvas descarta EXIF.
  if(typeof createImageBitmap==='function')source=await createImageBitmap(file,{imageOrientation:'from-image'});
  else {url=URL.createObjectURL(file);source=new Image();source.src=url;await source.decode();}
  const w=source.width,h=source.height;
  if(!w||!h||w*h>50000000)throw Error('La imagen es demasiado grande. Usa una foto de hasta 50 megapíxeles.');
  const canvas=document.createElement('canvas');let scale=Math.min(1,1600/Math.max(w,h));
  for(let attempt=0;attempt<4;attempt++){
   canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
   const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);
   for(const quality of [.88,.76,.64]){
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
    if(blob&&blob.size<=MAX_IMAGE_BYTES){const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)});return {mimeType:'image/jpeg',data:dataUrl.split(',')[1],dataUrl,bytes:blob.size};}
   }
   scale*=.75;
  }
  throw Error('No pude reducir la foto. Prueba con otra imagen.');
 }catch(e){if(e.message?.startsWith('La imagen')||e.message?.startsWith('No pude reducir'))throw e;throw Error('No pude abrir esta foto. Prueba con JPG, PNG o WebP; si es HEIC, expórtala como JPG.');}
 finally{source?.close?.();if(url)URL.revokeObjectURL(url);}
}
