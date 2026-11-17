// Vercel Serverless Function (Node.js). Le jeton ne quitte jamais le serveur vers un tiers autre que NovelAI.
const ENDPOINT = 'https://image.novelai.net/ai/generate-image';
const MODELS = new Set(['nai-diffusion-4-5-full','nai-diffusion-4-5-curated','nai-diffusion-5-full','nai-diffusion-5-curated']);
const SAMPLERS = new Set(['k_euler_ancestral','k_euler','k_dpmpp_2m']);
const clamp = (value, lo, hi, fallback) => Number.isFinite(Number(value)) ? Math.min(hi,Math.max(lo,Number(value))) : fallback;
module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method !== 'POST') return res.status(405).json({error:'Méthode non autorisée.'});
  try {
    const body = req.body || {};
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if(!token || token.length > 4096) return res.status(400).json({error:'Jeton API NovelAI requis.'});
    if(!prompt || prompt.length > 20000) return res.status(400).json({error:'Prompt manquant ou trop long.'});
    if(!MODELS.has(body.model)) return res.status(400).json({error:'Modèle non pris en charge.'});
    if(!SAMPLERS.has(body.sampler)) return res.status(400).json({error:'Sampler non pris en charge.'});
    const width = Number(body.width), height = Number(body.height);
    if(![[832,1216],[1216,832],[1024,1024]].some(([w,h])=>w===width&&h===height)) return res.status(400).json({error:'Dimensions non prises en charge.'});
    const v5 = body.model.startsWith('nai-diffusion-5');
    const negative_prompt = String(body.negative_prompt || '').slice(0,20000);
    const seed = Math.floor(clamp(body.seed,0,4294967295,0));
    const parameters = {
      params_version:v5?4:3,
      width,height,n_samples:1,
      steps:Math.round(clamp(body.steps,1,50,28)),
      scale:clamp(body.scale,0,20,5),
      cfg_rescale:clamp(body.cfg_rescale,0,1,0),
      sampler:body.sampler,
      noise_schedule:'karras',
      seed,
      negative_prompt,
      qualityToggle:true,
      ucPreset:0,
      // V4+ requires a structured caption as well as the plain input.
      v4_prompt:{caption:{base_caption:prompt,char_captions:[]},use_coords:false,use_order:true},
      v4_negative_prompt:{caption:{base_caption:negative_prompt,char_captions:[]},use_coords:false,use_order:true}
    };
    const payload={input:prompt,model:body.model,action:'generate',parameters};
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),55000);
    let upstream;
    try{
      upstream = await fetch(ENDPOINT,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:controller.signal});
    } finally {clearTimeout(timer);}
    if(!upstream.ok){
      let detail='';
      try {const failure=await upstream.json();detail=String(failure.message || failure.error || '').slice(0,300);}catch{}
      const common={401:'Jeton API invalide ou expiré.',402:'Solde Anlas insuffisant.',403:'Accès refusé par NovelAI.',429:'Limite de requêtes NovelAI atteinte. Réessayez plus tard.',504:'NovelAI a dépassé le délai de réponse.'};
      return res.status(upstream.status>=400&&upstream.status<600?upstream.status:502).json({error:common[upstream.status]||('NovelAI HTTP '+upstream.status+(detail?' : '+detail:''))});
    }
    const data=await upstream.json();
    if(!Array.isArray(data.images)||!data.images.length||typeof data.images[0].image!=='string') return res.status(502).json({error:'Réponse JSON de NovelAI inattendue. Vérifiez le modèle et les paramètres.'});
    // Vercel Functions have payload size limits: avoid returning huge base64 bodies.
    const output={images:data.images.map(({image,seed,index})=>({image,seed,index}))};
    const size=Buffer.byteLength(JSON.stringify(output));
    if(size>4_000_000) return res.status(413).json({error:'Image trop volumineuse pour la limite de réponse Vercel. Essayez un autre format.'});
    return res.status(200).json(output);
  } catch(error){
    if(error?.name==='AbortError') return res.status(504).json({error:'Génération trop longue pour la fonction Vercel. Réessayez.'});
    console.error('NovelAI generation failed',error?.name||'UnknownError');
    return res.status(502).json({error:'Connexion à NovelAI impossible. Vérifiez votre réseau, le statut du service et votre configuration Vercel.'});
  }
};