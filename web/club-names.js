import { clubById, classifyFootballClubReference } from '../dist/catalog/football/index.js';

// Presentation only. Persisted identity remains the authoritative club ID.
const places=['Albor','Valdeluz','Montelago','Puerto Claro','Valdemar','Ribera Alta','Sierra Azul','Costa Verde','Las Encinas','Buenavista','Miralba','San Telmo','Villaclara','Pinar Alto','Fuente Serena','Castelluna','Los Olivos','Puente Viejo','Santa Vega','Monte Claro','Río Blanco','Valleverde','Loma Alta','Puerto del Sol','Las Lomas','Villa del Río','Mar Serena','Piedra Clara','Prado Alto','Valle del Faro','Cerro Verde','La Alameda'];
const prefixes={Development:'Atlético',Foreign:'Sporting',Loan:'Unión',Domestic:'Deportivo',Summer:'Racing',SIM_OPP:'C. D.'};
const aliasNames=Object.freeze({
  NEW_CLUB:['Nuevo club','Nuevo club'],
  DEVELOPMENT_CLUB:['Club de desarrollo','Desarrollo'],
  DEVELOPMENT_CLUB_2:['Segundo club de desarrollo','Desarrollo 2'],
  HIGHER_CLUB:['Club de categoría superior','Club superior'],
  BIG_CLUB:['Gran club','Gran club'],
  FOREIGN_DEV_CLUB:['Club de desarrollo extranjero','Desarrollo ext.']
});

function result(id,kind,name,shortName=name){
  return Object.freeze({id,kind,name,shortName});
}

function legacyPresentation(id){
  const generated=/^(Development|Foreign|Loan|Domestic|Summer|SIM_OPP)_(\d+)_(\d+)$/.exec(id);
  if(generated){
    const [,family,tier,number]=generated;
    const place=places[Number(number)];
    const base=place?prefixes[family]+' '+place:'Club '+number;
    return result(id,'legacy_compat',base+' · categoría '+tier,base);
  }
  if(/^SIM_OPP_(?:\d+_TEST|TEST)$/i.test(id))return result(id,'legacy_compat','Rival histórico','Rival');
  if(/^Club \d+ · \d+$/.test(id))return result(id,'legacy_compat',id,id);
  return result(id,'legacy_compat',id,id);
}

export function clubPresentation(value){
  const id=typeof value==='string'?value.trim():'';
  if(!id)return result('','unknown','Club desconocido','Club');

  const club=clubById(id);
  if(club)return result(id,'catalog',club.name,club.shortName);

  if(id==='UDV')return result(id,'canonical_special','U. D. Valdoria','Valdoria');

  const classification=classifyFootballClubReference(id);
  if(classification.kind==='narrative_alias'){
    const names=aliasNames[id]??['Club por determinar','Club'];
    return result(id,'narrative_alias',names[0],names[1]);
  }
  if(classification.kind==='legacy_compat')return legacyPresentation(id);

  return result(id,'unknown','Club desconocido','Club');
}

export function formatClubName(value,{compact=false}={}){
  const presentation=clubPresentation(value);
  return compact?presentation.shortName:presentation.name;
}
