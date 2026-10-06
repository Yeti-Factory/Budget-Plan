function normalizeBriefExtraction(extracted){
 if(typeof extracted?.summary!=='string'||!extracted.summary.trim()||typeof extracted.missing!=='string'||!Array.isArray(extracted.fields))throw new Error('Extraction invalide');
 const labels={containsProducts:'présence de produits',project:'nom du projet',category:'catégorie',objective:'objectif',sector:'secteur',plvType:'type de PLV',material:'matière',channel:'circuit',position:'positionnement',duration:'durée',price:'prix public TTC',vat:'TVA',quantity:'capacité produits',count:'nombre de PLV',cycles:'chargements',sellthrough:'part vendue',share:'part reçue par la marque',margin:'marge de contribution',uplift:'hausse des ventes',allocation:'part du gain allouée'};
 const groups=new Map();const warnings=[];
 for(const field of extracted.fields.slice(0,200)){if(!field||!briefKeys.includes(field.key)){warnings.push('Un champ non reconnu a été écarté.');continue;}if(!groups.has(field.key))groups.set(field.key,[]);groups.get(field.key).push(field);}
 const fields=[];const withoutProducts=extracted.fields.some(f=>f?.key==='containsProducts'&&f.value==='Sans produit'&&typeof f.evidence==='string'&&/sans produit|aucun produit/i.test(f.evidence));
 for(const [key,entries]of groups){const values=entries.map(f=>typeof f.value==='string'?f.value.trim():null);if(new Set(values).size!==1){warnings.push('Valeurs contradictoires pour '+labels[key]+' : champ laissé à vérifier.');continue;}const field=entries[0];let value=values[0];
 if(withoutProducts&&['price','vat','quantity','cycles','sellthrough','share','margin','uplift','allocation'].includes(key)){warnings.push('Donnée produit écartée pour une PLV sans produit : '+labels[key]+'.');continue;}
 if(!value||value.length>200||typeof field.evidence!=='string'||!field.evidence.trim()){warnings.push('Information non importée pour '+labels[key]+' : libellé trop long ou preuve absente.');continue;}
 if(/^(pas défini|pas définie|non défini|non définie|inconnu|inconnue)$/i.test(value)||/non (précisé|précisée|fourni|fournie|indiqué|indiquée|disponible)|pas de .{0,80}mentionné|aucun .{0,80}mentionné/i.test(field.evidence)){warnings.push('Information absente pour '+labels[key]+' : votre saisie est conservée.');continue;}
 if(key==='containsProducts'&&!['Avec produits','Sans produit'].includes(value)){warnings.push('Présence de produits à préciser.');continue;}
 if(typeof defaults[key]==='number'){value=value.replace(',','.');if(!/^\d+(\.\d+)?$/.test(value)||validate({...defaults,[key]:Number(value)}).length){warnings.push('Valeur non importée pour '+labels[key]+' : unité ou valeur à préciser.');continue;}}
 fields.push({key,value,evidence:field.evidence.trim().slice(0,1000)});
 }
 if(extracted.summary.length>5000)warnings.push('Résumé abrégé : vérifiez les détails du document.');
 if(extracted.fields.length>200)warnings.push('Le nombre de champs dépasse la limite : vérifiez les détails du document.');
 return {summary:extracted.summary.trim().slice(0,5000),missing:[extracted.missing.trim().slice(0,3000),...new Set(warnings)].filter(Boolean).join('\n').slice(0,5000),fields};
}
