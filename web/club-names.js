// Presentation only: these fictional names never replace the club IDs in saves.
const places=['Albor','Valdeluz','Montelago','Puerto Claro','Valdemar','Ribera Alta','Sierra Azul','Costa Verde','Las Encinas','Buenavista','Miralba','San Telmo','Villaclara','Pinar Alto','Fuente Serena','Castelluna','Los Olivos','Puente Viejo','Santa Vega','Monte Claro','Río Blanco','Valleverde','Loma Alta','Puerto del Sol','Las Lomas','Villa del Río','Mar Serena','Piedra Clara','Prado Alto','Valle del Faro','Cerro Verde','La Alameda'];
const prefixes={Development:'Atlético',Foreign:'Sporting',Loan:'Unión',Domestic:'Deportivo',Summer:'Racing',SIM_OPP:'C. D.'};
export function formatClubName(value){
 const name=String(value??'');
 if(name==='UDV')return 'U. D. Valdoria';
 if(name==='BIG_CLUB')return 'Gran club';
 const match=/^(Development|Foreign|Loan|Domestic|Summer|SIM_OPP)_(\d+)_(\d+)$/.exec(name);
 if(!match)return name;
 const [,family,tier,number]=match;
 const place=places[Number(number)];
 return (place?prefixes[family]+' '+place:'Club '+number)+' · categoría '+tier;
}
