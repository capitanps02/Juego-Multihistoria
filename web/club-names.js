import { FOOTBALL_CLUBS } from '../dist/catalog/football/index.js';

// Presentation only: display labels never replace persisted club IDs.
const catalogNames=new Map(FOOTBALL_CLUBS.map(club=>[club.id,club.name]));
const places=['Albor','Valdeluz','Montelago','Puerto Claro','Valdemar','Ribera Alta','Sierra Azul','Costa Verde','Las Encinas','Buenavista','Miralba','San Telmo','Villaclara','Pinar Alto','Fuente Serena','Castelluna','Los Olivos','Puente Viejo','Santa Vega','Monte Claro','Río Blanco','Valleverde','Loma Alta','Puerto del Sol','Las Lomas','Villa del Río','Mar Serena','Piedra Clara','Prado Alto','Valle del Faro','Cerro Verde','La Alameda'];
const prefixes={Development:'Atlético',Foreign:'Sporting',Loan:'Unión',Domestic:'Deportivo',Summer:'Racing',SIM_OPP:'C. D.'};
const aliases={
 NEW_CLUB:'Nuevo club',
 DEVELOPMENT_CLUB:'Club de desarrollo',
 DEVELOPMENT_CLUB_2:'Club de desarrollo',
 HIGHER_CLUB:'Club de categoría superior',
 BIG_CLUB:'Gran club',
 FOREIGN_DEV_CLUB:'Club extranjero de desarrollo'
};
export function formatClubName(value){
 const name=String(value??'');
 if(name==='UDV')return 'U. D. Valdoria';
 const catalog=catalogNames.get(name);if(catalog)return catalog;
 if(aliases[name])return aliases[name];
 const match=/^(Development|Foreign|Loan|Domestic|Summer|SIM_OPP)_(\d+)_(\d+)$/.exec(name);
 if(match){
  const [,family,tier,number]=match;
  const place=places[Number(number)];
  return (place?prefixes[family]+' '+place:'Club '+number)+' · categoría '+tier;
 }
 if(/^[A-Z]{3}_[A-Z0-9_]+$/.test(name))return 'Club desconocido';
 return name;
}
