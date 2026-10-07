export const defaults={project:'Nouveau projet PLV',containsProducts:'Avec produits',category:'Pas définie',plvType:'Pas défini',material:'Pas défini',objective:'Lancement de produit',sector:'Cosmétique & beauté',channel:'Magasin spécialisé',position:'Premium',duration:'12 mois',price:null,vat:null,quantity:null,cycles:null,sellthrough:null,makerMargin:25,count:100,brief:''};
export function validate(d){
 const errors=[];if(!['Avec produits','Sans produit'].includes(d.containsProducts))errors.push('Mode de PLV invalide.');
 const bounds={price:[0.01,100000],vat:[0,100],quantity:[1,100000],cycles:[1,10000],sellthrough:[0,100],makerMargin:[0,99],count:[1,1000000]};
 for(const [key,[min,max]] of Object.entries(bounds)) {if(['price','vat','quantity','cycles','sellthrough'].includes(key)&&d[key]==null)continue;if(typeof d[key]!=='number'||!Number.isFinite(d[key])||d[key]<min||d[key]>max) errors.push('Valeur invalide : '+key+'.');}
 for(const key of ['quantity','cycles','count']) if(d[key]!=null&&!Number.isInteger(d[key])) errors.push('Un entier est requis : '+key+'.');
 for(const key of ['project','category','plvType','material','objective','sector','channel','position','duration','brief']) if(typeof d[key]!=='string'||d[key].length>(key==='brief'?12000:200)) errors.push('Texte invalide : '+key+'.');
 return errors;
}
