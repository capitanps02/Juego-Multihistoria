import type { EventDefinition, EventFamily, GameState, SeedTransition } from "../../../core/types.js";

export type ExternalPrincipalStatus = "AWAITING_EXTERNAL_FACT";

export interface StagedExternalPrincipal {
  event: EventDefinition;
  status: ExternalPrincipalStatus;
  requiredFacts: readonly string[];
  forbiddenProxies: readonly string[];
  terminalChoiceIds: readonly string[];
}

/**
 * Canonical 34+ principals whose local A8 work is staged to the last point before an external
 * factual authority. These definitions are deliberately NOT registered in EVENTS_34_PLUS.
 * Their gates are closed by stagedExternalPrincipalEligible() until the named facts are supplied
 * by the owning shared authority. No proxy can open them.
 */
const SPECS = [
  {
    "id": "EVT_34_BRIDGE_001",
    "age": 34,
    "family": "market",
    "title": "La reunión sin horizonte",
    "body": "Tu club no quiere hablar de último contrato; propone un año y revisar en marzo. Tú quieres saber si de verdad cuentan contigo.",
    "visible": [
      "Rol previsto",
      "salario",
      "calendario de conversaciones"
    ],
    "uncertain": [
      "El club puede estar siendo prudente",
      "puede estar preparando sucesión",
      "puede estar esperando ver tu cuerpo"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Firmar un año sin más."
      },
      {
        "id": "B",
        "label": "Exigir definición de rol."
      },
      {
        "id": "C",
        "label": "Esperar hasta agosto."
      },
      {
        "id": "D",
        "label": "Pedir salida si no hay compromiso."
      }
    ],
    "seeds": [
      "SEED_AGE34_REALITY"
    ],
    "requires": [
      "authoritative_same_club_negotiation_or_formal_renewal_offer",
      "contract_horizon",
      "role_expectation_fact_if_displayed"
    ],
    "forbidden": [
      "direct_contract_mutation",
      "synthetic_renewal",
      "age_as_proof_of_decline"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_PAY_001",
    "age": 34,
    "family": "market",
    "title": "La cifra que ya no te pagan",
    "body": "La renovación baja tu salario un 35 %, aunque sigues siendo importante. El club argumenta edad y estructura, no rendimiento.",
    "visible": [
      "Oferta",
      "comparables parciales",
      "rendimiento reciente"
    ],
    "uncertain": [
      "No sabes si otro club pagará más",
      "no sabes si la rebaja es política interna"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Aceptar."
      },
      {
        "id": "B",
        "label": "Pedir primas por minutos/títulos."
      },
      {
        "id": "C",
        "label": "Rechazar por estatus."
      },
      {
        "id": "D",
        "label": "Filtrar que escuchas mercado."
      }
    ],
    "seeds": [
      "SEED_VETERAN_PAYCUT"
    ],
    "requires": [
      "real_same_club_renewal_offer",
      "historical_salary_fact",
      "salary_terms"
    ],
    "forbidden": [
      "synthetic_35_percent_cut",
      "marketHeat_as_offer"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_HOME_001",
    "age": 34,
    "family": "market",
    "title": "Valdoria no puede igualarlo",
    "body": "UDV te quiere, pero su mejor oferta es muy inferior a dos propuestas exteriores. A cambio tendrías rol central y un proyecto deportivo real.",
    "visible": [
      "Salario",
      "rol",
      "duración",
      "plantilla",
      "objetivos"
    ],
    "uncertain": [
      "No sabes cuánto pesa para ti volver hasta vivirlo",
      "no sabes si el equipo será competitivo"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Volver."
      },
      {
        "id": "B",
        "label": "Usar la oferta para mejorar otras."
      },
      {
        "id": "C",
        "label": "Pedir a UDV más poder deportivo."
      },
      {
        "id": "D",
        "label": "Posponer un año."
      }
    ],
    "seeds": [
      "SEED_FINAL_HOME_WINDOW"
    ],
    "requires": [
      "former_club_history",
      "real_UDV_offer",
      "two_real_external_offers_for_full_canonical_premise",
      "role_and_project_facts_when_displayed"
    ],
    "forbidden": [
      "HOME_PULL_as_offer",
      "synthetic_competing_offers",
      "direct_club_change"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_AGT_001",
    "age": 34,
    "family": "agent",
    "title": "El agente dice que esperes",
    "body": "Tu agente afirma que en dos semanas caerá una oferta mejor. Hoy tienes una propuesta sólida con fecha de caducidad.",
    "visible": [
      "Oferta existente",
      "confianza histórica del agente"
    ],
    "uncertain": [
      "No sabes si la oferta futura existe",
      "puede ser un sondeo",
      "puede ser una apuesta del agente por una comisión mayor"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Esperar."
      },
      {
        "id": "B",
        "label": "Firmar la segura."
      },
      {
        "id": "C",
        "label": "Hablar directamente con el club futuro."
      },
      {
        "id": "D",
        "label": "Pedir prueba concreta al agente."
      }
    ],
    "seeds": [
      "SEED_LAST_AGENT_GAMBLE"
    ],
    "requires": [
      "resolveActiveAgent_non_null",
      "at_least_one_real_formal_offer",
      "offer_expiry_fact",
      "certified_agent_history_for_trust"
    ],
    "forbidden": [
      "agentControl_as_identity",
      "invented_future_offer",
      "rumor_as_formal_offer"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_CON_001",
    "age": 34,
    "family": "contract",
    "title": "La cláusula de salida digna",
    "body": "Un club te ofrece dos años si aceptas una cláusula que permite terminar el segundo verano con indemnización baja si tu rol cae.",
    "visible": [
      "Duración",
      "salario",
      "cláusula"
    ],
    "uncertain": [
      "No sabes si la cláusula protege al club o también evita que quedes atrapado"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Aceptarla."
      },
      {
        "id": "B",
        "label": "Pedir que sea bilateral."
      },
      {
        "id": "C",
        "label": "Cambiar a un año sin cláusula."
      },
      {
        "id": "D",
        "label": "Rechazar y buscar seguridad total."
      }
    ],
    "seeds": [
      "SEED_DIGNIFIED_EXIT_CLAUSE"
    ],
    "requires": [
      "real_multiyear_offer",
      "conditional_exit_clause_authority_or_explicit_noncontractual_model"
    ],
    "forbidden": [
      "fake_clause_in_seed_only_when_presented_as_contract",
      "direct_contract_mutation"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_MAR_001",
    "age": 34,
    "family": "market",
    "title": "Marzo: el club no llama",
    "body": "Habían prometido revisar tu contrato en marzo y pasan dos semanas sin reunión.",
    "visible": [
      "Fecha",
      "silencio",
      "rumores"
    ],
    "uncertain": [
      "No sabes si esperan presupuesto",
      "no sabes si esperan entrenador",
      "no sabes si esperan sustituto"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Pedir reunión."
      },
      {
        "id": "B",
        "label": "Empezar a negociar fuera sin avisar."
      },
      {
        "id": "C",
        "label": "Esperar hasta abril."
      },
      {
        "id": "D",
        "label": "Filtrar que no hay conversaciones."
      }
    ],
    "seeds": [
      "SEED_MARCH_SILENCE"
    ],
    "requires": [
      "short_contract_fact",
      "persisted_or_authoritative_informal_review_promise",
      "calendar_date"
    ],
    "forbidden": [
      "marketHeat_as_silence",
      "invented_promise",
      "monthsRemaining_as_free_agency"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_MKT_001",
    "age": 35,
    "family": "market",
    "title": "Tres ofertas, tres versiones de ti",
    "body": "Un candidato a títulos te ve como especialista, un club medio como titular y UDV como símbolo-líder.",
    "visible": [
      "Roles reales",
      "condiciones reales"
    ],
    "uncertain": [
      "No sabes qué versión de ti seguirá existiendo en febrero"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Especialista arriba."
      },
      {
        "id": "B",
        "label": "Titular más abajo."
      },
      {
        "id": "C",
        "label": "UDV."
      },
      {
        "id": "D",
        "label": "Esperar una cuarta opción."
      }
    ],
    "seeds": [
      "SEED_THREE_VERSIONS_35"
    ],
    "requires": [
      "three_real_concurrent_offer_contexts_for_full_canonical_scene",
      "real_club_tiers_or_competitive_context",
      "role_expectation_facts"
    ],
    "forbidden": [
      "invented_three_offer_menu",
      "reputation_as_offer",
      "direct_signing"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_CON_001",
    "age": 35,
    "family": "contract",
    "title": "Contrato por objetivos físicos",
    "body": "Te ofrecen fijo bajo y primas fuertes por convocatorias, minutos y disponibilidad.",
    "visible": [
      "Fórmula contractual",
      "métricas"
    ],
    "uncertain": [
      "No sabes si al club le incentiva gestionarte bien o evitar activar pagos"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Aceptar."
      },
      {
        "id": "B",
        "label": "Convertir parte en primas colectivas."
      },
      {
        "id": "C",
        "label": "Pedir mínimo garantizado mayor."
      },
      {
        "id": "D",
        "label": "Rechazar por desconfianza."
      }
    ],
    "seeds": [
      "SEED_AVAILABILITY_CONTRACT"
    ],
    "requires": [
      "real_veteran_offer",
      "factual_body_or_availability_context",
      "performance_bonus_contract_authority"
    ],
    "forbidden": [
      "synthetic_physical_doubt",
      "unsupported_bonus_terms",
      "direct_contract_mutation"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_FAREWELL_001",
    "age": 35,
    "family": "sport",
    "title": "El club ofrece homenaje... si te vas",
    "body": "Tu club propone una despedida enorme si no renuevas; si sigues, no garantiza cuándo podrá organizar algo parecido.",
    "visible": [
      "Oferta de homenaje",
      "contrato alternativo limitado"
    ],
    "uncertain": [
      "No sabes si continuar te hará perder un cierre perfecto",
      "no sabes si realmente quieres un cierre diseñado por otros"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Aceptar despedida y salir."
      },
      {
        "id": "B",
        "label": "Renovar y renunciar al timing perfecto."
      },
      {
        "id": "C",
        "label": "Salir sin gran ceremonia."
      },
      {
        "id": "D",
        "label": "Pedir homenaje independientemente del futuro."
      }
    ],
    "seeds": [
      "SEED_FAREWELL_AS_LEVERAGE",
      "SEED_PUBLIC_MYTH_FINAL"
    ],
    "requires": [
      "institutional_legend_fact",
      "authoritative_contract_expiry_context",
      "real_renewal_or_exit_option",
      "factual_club_farewell_proposal"
    ],
    "forbidden": [
      "retirement_announcement",
      "synthetic_homage",
      "contract_expiry_as_free_agency"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_AGT_001",
    "age": 35,
    "family": "agent",
    "title": "Sin agente por primera vez",
    "body": "Una negociación sencilla podría cerrarse sin agente. Tu representante histórico insiste en que el último contrato es precisamente cuando más le necesitas.",
    "visible": [
      "Oferta",
      "honorarios"
    ],
    "uncertain": [
      "No sabes qué conversaciones invisibles perderás",
      "no sabes cuánto sesgo tiene el agente al defender su utilidad"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Negociar tú con abogado."
      },
      {
        "id": "B",
        "label": "Mantener agente."
      },
      {
        "id": "C",
        "label": "Pagar tarifa fija sin comisión."
      },
      {
        "id": "D",
        "label": "Cambiar de agente para el cierre."
      }
    ],
    "seeds": [
      "SEED_FINAL_AGENT_STRUCTURE"
    ],
    "requires": [
      "real_offer_or_negotiation_context",
      "certified_active_agent_or_explicit_no_agent_state",
      "authoritative_agent_relationship_history"
    ],
    "forbidden": [
      "agentControl_as_identity",
      "invented_lawyer_or_replacement_agent_as_persistent_NPC",
      "direct_contract_mutation"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_JAN_001",
    "age": 35,
    "family": "market",
    "title": "Una oferta en enero",
    "body": "Un club con lesiones te ofrece seis meses y opción por otro año. Jugarías más pero abandonarías un proyecto que puede competir por títulos.",
    "visible": [
      "Oferta",
      "situación de ambos clubes"
    ],
    "uncertain": [
      "No sabes si los lesionados volverán rápido",
      "no sabes si tu club actual te necesitará en primavera"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Irte."
      },
      {
        "id": "B",
        "label": "Quedarte."
      },
      {
        "id": "C",
        "label": "Pedir cesión corta."
      },
      {
        "id": "D",
        "label": "Negociar salida solo si juegas menos en dos semanas."
      }
    ],
    "seeds": [
      "SEED_LAST_JANUARY_MOVE"
    ],
    "requires": [
      "real_january_offer",
      "authoritative_current_role_or_usage_context",
      "real_current_and_target_club_competitive_context"
    ],
    "forbidden": [
      "roleScore_as_current_role",
      "synthetic_injury_crisis_at_target_club",
      "direct_transfer_mutation"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_HOME_001",
    "age": 35,
    "family": "market",
    "title": "El ascenso de Valdoria",
    "body": "UDV logra ascenso o una temporada histórica sin ti, justo cuando tu contrato termina.",
    "visible": [
      "Resultado",
      "mensajes del entorno"
    ],
    "uncertain": [
      "No sabes si ahora necesitan tu nombre menos que antes",
      "no sabes si el nuevo nivel hace tu regreso más útil"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Llamar tú."
      },
      {
        "id": "B",
        "label": "Esperar a que llamen."
      },
      {
        "id": "C",
        "label": "No mezclar emoción con mercado."
      },
      {
        "id": "D",
        "label": "Felicitar públicamente dejando la puerta abierta."
      }
    ],
    "seeds": [
      "SEED_HOME_SUCCESS_WITHOUT_YOU"
    ],
    "requires": [
      "former_club_history",
      "authoritative_UDV_promotion_or_historic_season_fact",
      "current_contract_end_context"
    ],
    "forbidden": [
      "fabricated_UDV_success",
      "phone_call_as_formal_offer",
      "contract_end_as_free_agency"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_36_CON_001",
    "age": 36,
    "family": "contract",
    "title": "Renovar después de una gran temporada",
    "body": "Con 36 haces una temporada mejor de lo esperado y el club ofrece dos años.",
    "visible": [
      "Oferta",
      "rendimiento reciente"
    ],
    "uncertain": [
      "No sabes si es un nuevo equilibrio",
      "no sabes si fue una temporada excepcional difícil de repetir"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Dos años."
      },
      {
        "id": "B",
        "label": "Uno."
      },
      {
        "id": "C",
        "label": "Esperar mercado."
      },
      {
        "id": "D",
        "label": "Renovar con salida bilateral."
      }
    ],
    "seeds": [
      "SEED_AGE36_LONG_DEAL"
    ],
    "requires": [
      "authoritative_recent_season_performance_fact",
      "explicit_body_sustainability_evidence",
      "real_same_club_multiyear_offer"
    ],
    "forbidden": [
      "form_proxy_as_full_season_fact",
      "age_only_body_sustainability",
      "synthetic_renewal"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_36_LOWER_001",
    "age": 36,
    "family": "market",
    "title": "Un año en una liga menor",
    "body": "Un club de categoría inferior pero profesional te ofrece ser titular y referente.",
    "visible": [
      "Nivel",
      "salario",
      "rol"
    ],
    "uncertain": [
      "No sabes si disfrutarás competir más abajo",
      "no sabes si el cuerpo agradecerá o sufrirá un fútbol distinto"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Aceptar."
      },
      {
        "id": "B",
        "label": "Preferir retirarte en nivel alto."
      },
      {
        "id": "C",
        "label": "Buscar UDV."
      },
      {
        "id": "D",
        "label": "Esperar otro mercado."
      }
    ],
    "seeds": [
      "SEED_DROP_LEVEL_TO_PLAY"
    ],
    "requires": [
      "real_lower_level_formal_offer",
      "real_target_tier",
      "role_expectation_fact_if_displayed"
    ],
    "forbidden": [
      "marketFloor_as_offer",
      "direct_tier_change",
      "agent8_terminal_retirement_transition"
    ],
    "ownerRefs": [],
    "terminalChoices": [
      "B"
    ],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_37_SHORT_001",
    "age": 37,
    "family": "market",
    "title": "Contrato de tres meses",
    "body": "Un club con una emergencia te ofrece solo tres meses hasta final de temporada.",
    "visible": [
      "Duración",
      "rol",
      "calendario"
    ],
    "uncertain": [
      "No sabes si servirá de escaparate",
      "no sabes si será despedida",
      "no sabes si será simple parche"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Aceptar."
      },
      {
        "id": "B",
        "label": "Rechazar por falta de proyecto."
      },
      {
        "id": "C",
        "label": "Pedir opción automática."
      },
      {
        "id": "D",
        "label": "Aceptar sin promesas y decidir después."
      }
    ],
    "seeds": [
      "SEED_THREE_MONTH_CONTRACT"
    ],
    "requires": [
      "authoritative_unattached_free_agent_state",
      "real_three_month_offer",
      "real_role_and_calendar_context"
    ],
    "forbidden": [
      "monthsRemaining_zero_as_free_agency",
      "synthetic_emergency_offer",
      "direct_contract_mutation"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_37_HOME_001",
    "age": 37,
    "family": "market",
    "title": "Valdoria te ofrece diez partidos",
    "body": "UDV solo puede garantizarte un papel parcial hasta junio, pero quiere que cierres allí.",
    "visible": [
      "Rol limitado",
      "contexto del club"
    ],
    "uncertain": [
      "No sabes si una despedida local con pocos minutos te satisfará más que seguir compitiendo fuera"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Volver aunque sea poco."
      },
      {
        "id": "B",
        "label": "Pedir un año completo."
      },
      {
        "id": "C",
        "label": "Seguir fuera."
      },
      {
        "id": "D",
        "label": "Volver solo si el equipo lo necesita deportivamente."
      }
    ],
    "seeds": [
      "SEED_TEN_MATCH_HOME_RETURN"
    ],
    "requires": [
      "former_club_history",
      "real_UDV_short_return_offer",
      "authoritative_partial_role_context"
    ],
    "forbidden": [
      "HOME_CLOSURE_PULL_as_offer",
      "sentimental_return_as_contract",
      "direct_club_change"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_38_RICH_001",
    "age": 38,
    "family": "market",
    "title": "Una última oferta enorme",
    "body": "Cuando casi habías decidido parar, llega una oferta de un año que multiplica cualquier alternativa.",
    "visible": [
      "Dinero",
      "rol de embajador",
      "duración"
    ],
    "uncertain": [
      "No sabes si el proyecto te quiere como futbolista o como nombre",
      "no sabes cuánto disfrutarás el año"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Aceptar."
      },
      {
        "id": "B",
        "label": "Rechazar y retirarte."
      },
      {
        "id": "C",
        "label": "Pedir calendario/rol deportivo mínimo."
      },
      {
        "id": "D",
        "label": "Aceptar solo seis meses."
      }
    ],
    "seeds": [
      "SEED_LAST_HUGE_OFFER"
    ],
    "requires": [
      "real_high_value_formal_offer",
      "authoritative_offer_duration_and_money",
      "factual_ambassador_role_if_displayed"
    ],
    "forbidden": [
      "reputation_as_offer",
      "synthetic_huge_offer",
      "agent8_terminal_retirement_transition"
    ],
    "ownerRefs": [],
    "terminalChoices": [
      "B"
    ],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_NT_001",
    "age": 34,
    "family": "selection",
    "title": "Última ventana de selección",
    "body": "El seleccionador te incluye en una prelista y avisa de que ya no garantizará convocatoria.",
    "visible": [
      "Competidores",
      "calendario",
      "mensaje del seleccionador"
    ],
    "uncertain": [
      "No sabes si aceptar rol secundario te dará un último torneo",
      "puede darte meses de viajes sin jugar"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Seguir disponible para cualquier rol."
      },
      {
        "id": "B",
        "label": "Pedir claridad."
      },
      {
        "id": "C",
        "label": "Retirarte internacionalmente ahora."
      },
      {
        "id": "D",
        "label": "Estar disponible solo para ventanas competitivas."
      }
    ],
    "seeds": [
      "SEED_FINAL_NT_POSTURE"
    ],
    "requires": [
      "authoritative_current_national_prelist",
      "international_cycle_context",
      "coach_message_or_selection_context"
    ],
    "forbidden": [
      "nationalStanding_as_current_call",
      "caps_as_prelist",
      "career_retirement_from_international_retirement"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_MATCH_001",
    "age": 34,
    "family": "sport",
    "title": "Un gol que rompe el plan",
    "body": "Entras en una eliminatoria, marcas el gol decisivo y todo el debate sobre tu rol cambia durante 48 horas.",
    "visible": [
      "Resultado",
      "titulares",
      "elogios"
    ],
    "uncertain": [
      "No sabes si el técnico cambiará su modelo por un momento heroico"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Pedir titularidad aprovechando el momento."
      },
      {
        "id": "B",
        "label": "Repetir que aceptas el rol."
      },
      {
        "id": "C",
        "label": "No hablar."
      },
      {
        "id": "D",
        "label": "Usarlo para abrir renovación."
      }
    ],
    "seeds": [
      "SEED_LAST_HERO_MOMENT"
    ],
    "requires": [
      "real_knockout_fixture",
      "authoritative_player_entry",
      "authoritative_decisive_goal",
      "real_result"
    ],
    "forbidden": [
      "cinematic_synthetic_goal",
      "aggregate_appearances_as_match",
      "form_as_decisive_impact"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_NT_002",
    "age": 34,
    "family": "selection",
    "title": "Te dejan fuera de una convocatoria",
    "body": "Por primera vez quedas fuera de una lista internacional estando sano.",
    "visible": [
      "Lista",
      "explicación pública genérica"
    ],
    "uncertain": [
      "No sabes si es descanso",
      "puede ser transición",
      "puede ser final no comunicado"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Llamar al seleccionador."
      },
      {
        "id": "B",
        "label": "Felicitar a los convocados."
      },
      {
        "id": "C",
        "label": "Anunciar retirada internacional."
      },
      {
        "id": "D",
        "label": "No reaccionar y esperar siguiente lista."
      }
    ],
    "seeds": [
      "SEED_NT_FIRST_OMISSION_LATE"
    ],
    "requires": [
      "authoritative_current_national_omission",
      "explicit_healthy_status",
      "prior_active_selection_context"
    ],
    "forbidden": [
      "nationalStanding_as_omission",
      "injury_absence_assumed_from_no_injury_flag",
      "career_retirement_from_international_retirement"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_TRAVEL_001",
    "age": 34,
    "family": "sport",
    "title": "El viaje que no haces",
    "body": "Te quedas en casa por plan de carga y el equipo logra una gran victoria sin ti.",
    "visible": [
      "Resultado",
      "descanso ganado"
    ],
    "uncertain": [
      "No sabes si el éxito refuerza la política de descansarte",
      "puede reducir tu centralidad"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Celebrar el plan."
      },
      {
        "id": "B",
        "label": "Pedir volver al siguiente once."
      },
      {
        "id": "C",
        "label": "No cambiar nada."
      },
      {
        "id": "D",
        "label": "Viajar siempre aunque no juegues."
      }
    ],
    "seeds": [
      "SEED_TEAM_WINS_WITHOUT_YOU"
    ],
    "requires": [
      "real_omitted_fixture",
      "authoritative_non_participation_due_to_load_plan",
      "real_team_victory",
      "travel_or_rest_context"
    ],
    "forbidden": [
      "synthetic_team_result",
      "invented_omission_reason",
      "aggregate_schedule_proxy"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_TACT_001",
    "age": 35,
    "family": "tactical",
    "title": "El nuevo rol funciona demasiado bien",
    "body": "Una reconversión te hace importante como organizador/interior aunque tus cifras ofensivas caigan.",
    "visible": [
      "Minutos",
      "métricas",
      "elogios del técnico"
    ],
    "uncertain": [
      "No sabes si el mercado exterior entiende el valor",
      "no sabes si ese rol existe con otro entrenador"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Especializarte del todo."
      },
      {
        "id": "B",
        "label": "Mantener capacidades antiguas."
      },
      {
        "id": "C",
        "label": "Buscar club que valore ese rol."
      },
      {
        "id": "D",
        "label": "Usarlo para renovar."
      }
    ],
    "seeds": [
      "SEED_FINAL_REINVENTION"
    ],
    "requires": [
      "authoritative_reinvented_role_fact",
      "real_recent_minutes_and_performance_metrics",
      "factual_manager_feedback_if_displayed"
    ],
    "forbidden": [
      "roleScore_as_role_definition",
      "generic_form_as_metrics",
      "synthetic_market_offer"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_RECORD_001",
    "age": 35,
    "family": "sport",
    "title": "El canterano rompe tu récord",
    "body": "Un joven del club supera un récord de precocidad o una marca que durante años se asoció contigo.",
    "visible": [
      "Récord",
      "celebración"
    ],
    "uncertain": [
      "No sabes si la prensa busca tu reacción por homenaje",
      "puede buscar conflicto generacional"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Felicitarlo con entusiasmo."
      },
      {
        "id": "B",
        "label": "Respuesta breve."
      },
      {
        "id": "C",
        "label": "Recordar que los récords cambian."
      },
      {
        "id": "D",
        "label": "Invitarlo a hablar en privado."
      }
    ],
    "seeds": [
      "SEED_RECORD_PASSED"
    ],
    "requires": [
      "authoritative_record_definition_and_value",
      "certified_young_club_successor_identity",
      "real_record_surpass_fact"
    ],
    "forbidden": [
      "invented_record",
      "npcRefs_as_successor_identity",
      "age_as_young_player_identity"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_NT_001",
    "age": 35,
    "family": "selection",
    "title": "Te llaman por una emergencia internacional",
    "body": "Una lesión de otro jugador abre una convocatoria inesperada tras meses fuera o incluso tras una retirada internacional reciente.",
    "visible": [
      "Llamada",
      "rol probable"
    ],
    "uncertain": [
      "No sabes si volver te dará un cierre mejor",
      "puede convertirte en parche simbólico"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Volver."
      },
      {
        "id": "B",
        "label": "Rechazar."
      },
      {
        "id": "C",
        "label": "Aceptar solo si puedes competir."
      },
      {
        "id": "D",
        "label": "Pedir 24 horas para hablar con club/familia."
      }
    ],
    "seeds": [
      "SEED_EMERGENCY_NT_RETURN"
    ],
    "requires": [
      "canonical_national_phasedown_memory",
      "authoritative_current_emergency_call",
      "real_relevant_international_fixture_or_tournament_context",
      "injury_replacement_cause_if_stated"
    ],
    "forbidden": [
      "nationalStanding_as_call",
      "synthetic_other_player_injury",
      "automatic_return_after_international_retirement"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_FINAL_001",
    "age": 35,
    "family": "sport",
    "title": "La final que miras desde fuera",
    "body": "Tu equipo llega a una final y el técnico no te incluye entre los primeros cambios previstos.",
    "visible": [
      "Plan",
      "convocatoria"
    ],
    "uncertain": [
      "No sabes si el partido pedirá tu perfil",
      "no sabes si esta será tu última final"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Prepararte sin protestar."
      },
      {
        "id": "B",
        "label": "Pedir conversación táctica."
      },
      {
        "id": "C",
        "label": "Mostrar que quieres entrar si hay prórroga."
      },
      {
        "id": "D",
        "label": "Filtrar malestar después, nunca antes."
      }
    ],
    "seeds": [
      "SEED_LAST_FINAL_BENCH"
    ],
    "requires": [
      "real_final_fixture",
      "authoritative_squad_call",
      "factual_preplanned_substitution_or_role_context"
    ],
    "forbidden": [
      "invented_final",
      "club_reputation_as_final",
      "synthetic_bench_or_sub_plan"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_36_BODY_001",
    "age": 36,
    "family": "medical",
    "title": "Ya no puedes jugar domingo-miércoles-domingo",
    "body": "Los datos muestran caída clara tras secuencias de tres partidos en ocho días.",
    "visible": [
      "Patrón de rendimiento propio"
    ],
    "uncertain": [
      "No sabes qué partidos serán realmente decisivos cuando hagas el plan"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Elegir uno de cada tres."
      },
      {
        "id": "B",
        "label": "Dejar al técnico elegir."
      },
      {
        "id": "C",
        "label": "Priorizar Europa/copa."
      },
      {
        "id": "D",
        "label": "Priorizar liga."
      }
    ],
    "seeds": [
      "SEED_COMPETITION_SELECTIVITY"
    ],
    "requires": [
      "authoritative_three_matches_in_eight_days_history",
      "measured_performance_drop_pattern",
      "explicit_recovery_limitation",
      "competition_calendar"
    ],
    "forbidden": [
      "age_as_recovery_limit",
      "invented_schedule",
      "generic_form_as_measured_pattern"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_36_RECORD_001",
    "age": 36,
    "family": "sport",
    "title": "El partido 700",
    "body": "Se acerca un hito enorme de partidos profesionales, pero coincide con una semana donde el staff recomienda descanso.",
    "visible": [
      "Número",
      "recomendación"
    ],
    "uncertain": [
      "No sabes si llegarás igualmente la semana siguiente",
      "una lesión podría impedirlo"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Jugar para asegurar hito."
      },
      {
        "id": "B",
        "label": "Descansar."
      },
      {
        "id": "C",
        "label": "Entrar solo si el marcador lo permite."
      },
      {
        "id": "D",
        "label": "No comunicar el hito al staff."
      }
    ],
    "seeds": [
      "SEED_700_MATCH_CHOICE"
    ],
    "requires": [
      "authoritative_professional_appearance_count_near_700",
      "real_upcoming_fixture",
      "explicit_staff_rest_recommendation",
      "load_context"
    ],
    "forbidden": [
      "fabricated_700th_match",
      "aggregate_appearance_count_without_next_fixture",
      "synthetic_staff_advice"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_37_PEN_001",
    "age": 37,
    "family": "sport",
    "title": "El penalti de despedida",
    "body": "En un partido con ambiente de despedida, el equipo recibe un penalti y el lanzador habitual te ofrece tirarlo.",
    "visible": [
      "Marcador",
      "lanzador",
      "contexto"
    ],
    "uncertain": [
      "No sabes si aceptar parece homenaje natural",
      "puede parecer anteponer narrativa al resultado"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Tirarlo."
      },
      {
        "id": "B",
        "label": "Dejar al especialista."
      },
      {
        "id": "C",
        "label": "Tirarlo solo si el partido está resuelto."
      },
      {
        "id": "D",
        "label": "Decidir según el capitán/entrenador."
      }
    ],
    "seeds": [
      "SEED_FAREWELL_PENALTY"
    ],
    "requires": [
      "real_match",
      "authoritative_farewell_or_possible_last_match_context",
      "real_penalty_awarded",
      "certified_regular_penalty_taker",
      "authoritative_penalty_assignment_or_choice_context",
      "captain_or_coach_authority_for_choice_D_if_named"
    ],
    "forbidden": [
      "cinematic_penalty_fabrication",
      "fabricated_farewell_match",
      "forced_goal_or_miss",
      "agent8_terminal_last_match_closure"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_DORSAL_001",
    "age": 34,
    "family": "team",
    "title": "Tu dorsal en la tienda",
    "body": "El club pregunta si aceptarías ceder tu dorsal histórico a un fichaje joven por razones comerciales y de sucesión.",
    "visible": [
      "Petición",
      "jugador",
      "campaña prevista"
    ],
    "uncertain": [
      "No sabes si es gesto aislado",
      "puede ser señal de que el club quiere pasar página"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Cederlo públicamente."
      },
      {
        "id": "B",
        "label": "Mantenerlo mientras sigas."
      },
      {
        "id": "C",
        "label": "Hablar primero con el joven."
      },
      {
        "id": "D",
        "label": "Proponer cambio la próxima temporada."
      }
    ],
    "seeds": [
      "SEED_FINAL_DORSAL"
    ],
    "requires": [
      "authoritative_historical_shirt_number",
      "certified_young_signing_or_successor_identity",
      "current_club_affiliation",
      "factual_club_request_or_campaign_context"
    ],
    "forbidden": [
      "npcRefs_as_successor",
      "invented_signing",
      "lockerPower_as_dorsal_authority"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_34_MENTOR_001",
    "age": 34,
    "family": "team",
    "title": "El joven te pide tus vídeos",
    "body": "Tu principal competidor te pide revisar juntos movimientos y vídeos.",
    "visible": [
      "Petición privada",
      "relación previa"
    ],
    "uncertain": [
      "No sabes si te admira",
      "puede buscar ventaja",
      "puede ser una sugerencia del club"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Ayudar sin reservas."
      },
      {
        "id": "B",
        "label": "Ayudar solo en aspectos no competitivos."
      },
      {
        "id": "C",
        "label": "Negarte con respeto."
      },
      {
        "id": "D",
        "label": "Convertirlo en trabajo conjunto con el staff."
      }
    ],
    "seeds": [
      "SEED_SUCCESSOR_ALLIANCE"
    ],
    "requires": [
      "certified_current_younger_teammate",
      "authoritative_competitor_or_successor_relation",
      "real_prior_relationship_context"
    ],
    "forbidden": [
      "invented_young_player",
      "relationship_score_as_identity",
      "age_only_successor"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_35_DUAL_001",
    "age": 35,
    "family": "sport",
    "title": "Te ofrecen ser jugador y enlace",
    "body": "UDV u otro club propone jugar y participar informalmente en captación/vestuario.",
    "visible": [
      "Funciones",
      "salario"
    ],
    "uncertain": [
      "No sabes si el doble rol ampliará influencia",
      "puede convertirte en jugador a medias"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Aceptar."
      },
      {
        "id": "B",
        "label": "Jugar sin función institucional."
      },
      {
        "id": "C",
        "label": "Pedir rol formal separado al retirarte."
      },
      {
        "id": "D",
        "label": "Rechazar por conflicto de intereses."
      }
    ],
    "seeds": [
      "SEED_PLAYER_LIAISON_ROLE"
    ],
    "requires": [
      "certified_offering_club_or_institutional_counterparty",
      "real_formal_playing_offer_or_authoritative_negotiation",
      "salary_terms",
      "factual_informal_liaison_functions"
    ],
    "forbidden": [
      "invented_institutional_role",
      "legacy_as_offer",
      "direct_contract_mutation",
      "promise_of_postcareer_job_as_fact_without_authority"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_36_CCH_001",
    "age": 36,
    "family": "tactical",
    "title": "Un entrenador más joven que tú",
    "body": "Llega un técnico de 35 años con ideas fuertes sobre intensidad y jerarquías.",
    "visible": [
      "Edad",
      "discurso",
      "primeros entrenamientos"
    ],
    "uncertain": [
      "No sabes si te ve como recurso táctico",
      "puede verte como problema cultural",
      "puede verte como aliado"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Adaptarte sin mencionar edad."
      },
      {
        "id": "B",
        "label": "Hablar pronto sobre carga."
      },
      {
        "id": "C",
        "label": "Ofrecer liderazgo."
      },
      {
        "id": "D",
        "label": "Esperar a que él defina relación."
      }
    ],
    "seeds": [
      "SEED_YOUNGER_COACH"
    ],
    "requires": [
      "authoritative_current_coach_change",
      "certified_current_coach_identity",
      "coach_age_or_generation_fact",
      "current_club_affiliation"
    ],
    "forbidden": [
      "invented_coach",
      "role_text_as_identity",
      "player_age_as_proof_coach_is_younger"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_36_PEER_001",
    "age": 36,
    "family": "social",
    "title": "El compañero se retira antes que tú",
    "body": "Un rival/compañero de tu generación anuncia retirada y te pregunta si tú también lo piensas.",
    "visible": [
      "Su decisión",
      "conversación privada"
    ],
    "uncertain": [
      "No sabes si su alivio te influye más de lo que admitirías"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Reconocer dudas."
      },
      {
        "id": "B",
        "label": "Decir que aún no."
      },
      {
        "id": "C",
        "label": "Pedirle que te cuente el proceso."
      },
      {
        "id": "D",
        "label": "Evitar compararte."
      }
    ],
    "seeds": [
      "SEED_PEER_RETIREMENT_MIRROR"
    ],
    "requires": [
      "certified_veteran_peer_identity",
      "authoritative_peer_retirement_announcement_or_career_state",
      "real_prior_relationship_or_peer_context"
    ],
    "forbidden": [
      "invented_peer",
      "relationship_score_as_identity",
      "age_as_peer_identity",
      "peer_retirement_as_protagonist_retirement"
    ],
    "ownerRefs": [],
    "terminalChoices": [],
    "externalStatus": "blocked_shared_authority"
  },
  {
    "id": "EVT_38_MARKET_001",
    "age": 38,
    "family": "sport",
    "title": "Nadie llama en julio",
    "body": "Termina tu contrato y pasan semanas sin una oferta profesional que cumpla tus condiciones.",
    "visible": [
      "Silencio real",
      "contactos informales"
    ],
    "uncertain": [
      "No sabes si el mercado despertará por una lesión en agosto",
      "puede haberse terminado"
    ],
    "choices": [
      {
        "id": "A",
        "label": "Bajar salario."
      },
      {
        "id": "B",
        "label": "Bajar nivel."
      },
      {
        "id": "C",
        "label": "Esperar hasta septiembre."
      },
      {
        "id": "D",
        "label": "Retirarte."
      },
      {
        "id": "E",
        "label": "Llamar tú a UDV/club concreto."
      }
    ],
    "seeds": [
      "SEED_MARKET_SILENCE_END",
      "SEED_MARKET_FLOOR_FINAL"
    ],
    "requires": [
      "authoritative_unattached_free_agent_state",
      "real_elapsed_weeks_without_acceptable_professional_offer",
      "formal_offer_and_contact_history",
      "current_search_conditions"
    ],
    "forbidden": [
      "monthsRemaining_zero_as_free_agency",
      "marketHeat_as_market_silence",
      "no_offer_as_auto_retirement",
      "direct_tier_or_salary_contract_mutation"
    ],
    "ownerRefs": [],
    "terminalChoices": [
      "D"
    ],
    "externalStatus": "blocked_shared_authority"
  }
] as const;

function seedTransitions(seedIds: readonly string[], choiceId: string): SeedTransition[] {
  return seedIds.map(seedId=>({seedId,action:"create" as const,intensity:64,payload:{choice:choiceId,stagedExternal:true}}));
}

function toEvent(spec: typeof SPECS[number]): EventDefinition {
  const choices=spec.choices.map(choice=>({
    id:choice.id,
    label:choice.label,
    intentTags:["canonical_34plus","external_authority"],
    outcomeIds:[`${spec.id}__${choice.id}__READY`]
  }));
  const outcomes=spec.choices.map(choice=>({
    id:`${spec.id}__${choice.id}__READY`,
    baseWeight:1,
    effects:[],
    messages:[`Decisión preparada; la autoridad externa debe validar y ejecutar el hecho factual antes de activar ${spec.id}.`],
    seedTransitions:seedTransitions(spec.seeds,choice.id),
    historyTags:["canonical_34plus","awaiting_external_fact",`choice_${choice.id}`]
  }));
  return {
    id:spec.id,
    ageWindow:[spec.age,null],
    phase:"34_plus",
    family:spec.family as EventFamily,
    gates:[{path:"flags.__A8_EXTERNAL_FACT_NEVER_SYNTHESIZE",op:"eq",value:true}],
    cooldown:99999,
    repeatable:false,
    weight:1,
    text:{title:spec.title,body:spec.body},
    intel:{visible:[...spec.visible],uncertain:[...spec.uncertain]},
    choices,
    outcomes,
    seedsWrite:[...spec.seeds],
    tags:["late_career","canonical_34plus","staged_not_registered","awaiting_external_fact"],
    canonStatus:"verified"
  };
}

export const STAGED_EXTERNAL_PRINCIPALS: readonly StagedExternalPrincipal[] = SPECS.map(spec=>({
  event:toEvent(spec),
  status:"AWAITING_EXTERNAL_FACT" as const,
  requiredFacts:[...spec.requires],
  forbiddenProxies:[...spec.forbidden],
  terminalChoiceIds:[...spec.terminalChoices]
}));

export function stagedExternalPrincipal(eventId:string):StagedExternalPrincipal|null {
  return STAGED_EXTERNAL_PRINCIPALS.find(row=>row.event.id===eventId)??null;
}

/**
 * Fail closed until a future owner-specific adapter supplies exact factual gates.
 * The boolean argument must come from a shared authoritative resolver, never a narrative proxy.
 */
export function stagedExternalPrincipalEligible(
  state:GameState,
  eventId:string,
  authoritativeFactsSatisfied:boolean
):boolean{
  const row=stagedExternalPrincipal(eventId);
  if(!row || !authoritativeFactsSatisfied) return false;
  return state.retirement.status==="playing" && state.age>=row.event.ageWindow[0];
}
