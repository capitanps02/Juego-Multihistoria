// MUIR P0 visual fixtures. TEST-ONLY: this module is not imported by any production entrypoint.
export const MUIR_BASE_SHA='36d3d1b0750b0ded877e55953f223e2de1169a46';
export const MUIR_PRIMARY_VIEWPORT={width:390,height:844};
export const MUIR_VIEWPORTS=[
  {id:'phone-360',width:360,height:800},
  {id:'phone-primary',width:390,height:844},
  {id:'phone-412',width:412,height:915},
  {id:'landscape-check',width:844,height:390},
  {id:'tablet-check',width:768,height:1024}
];
export const MUIR_FIXTURES=[
  {id:'home-normal',surface:'HOME',seed:424242,route:'home',recipe:'initial'},
  {id:'home-pending-decision',surface:'HOME',seed:42,route:'home',recipe:'pending-decision'},
  {id:'home-offer',surface:'OFFER',seed:123,route:'home',recipe:'offer'},
  {id:'result',surface:'RESULT',seed:42,route:'home',recipe:'result'},
  {id:'auto-running',surface:'AUTO_SIM',seed:1,route:'home',recipe:'auto-running'},
  {id:'auto-paused',surface:'AUTO_SIM',seed:777,route:'home',recipe:'auto-paused'},
  {id:'auto-interruption',surface:'AUTO_SIM',seed:42,route:'home',recipe:'auto-interruption'},
  {id:'period-summary',surface:'PERIOD_SUMMARY',seed:1,route:'career',recipe:'period-summary'},
  {id:'player-actions-menu',surface:'PLAYER_ACTIONS',seed:424242,route:'career',recipe:'player-actions-menu'},
  {id:'player-actions-category',surface:'PLAYER_ACTIONS',seed:424242,route:'career',recipe:'player-actions-category'},
  {id:'player-actions-detail',surface:'PLAYER_ACTIONS',seed:424242,route:'career',recipe:'player-actions-detail'},
  {id:'player-actions-result',surface:'PLAYER_ACTIONS',seed:424242,route:'career',recipe:'player-actions-result'},
  {id:'injury-public',surface:'HOME',seed:1,route:'home',recipe:'important-injury'},
  {id:'contract-offer',surface:'OFFER',seed:123,route:'home',recipe:'offer'},
  {id:'career',surface:'CARRERA',seed:424242,route:'career',recipe:'initial'},
  {id:'world',surface:'MUNDO',seed:424242,route:'world',recipe:'initial'},
  {id:'relations',surface:'RELACIONES',seed:424242,route:'relations',recipe:'initial'},
  {id:'profile',surface:'PERFIL',seed:424242,route:'profile',recipe:'initial'},
  {id:'save',surface:'TU_PARTIDA',seed:424242,route:'save',recipe:'initial'},
  {id:'cinematic-fallback',surface:'CINEMATIC',seed:42,route:'home',recipe:'cinematic-missing-asset'},
  {id:'epilogue-retirement',surface:'EPILOGUE',seed:424242,route:'career',recipe:'retirement'}
];

export function fixtureById(id){
  const fixture=MUIR_FIXTURES.find(row=>row.id===id);
  if(!fixture)throw new Error('Unknown MUIR fixture: '+id);
  return structuredClone(fixture);
}
