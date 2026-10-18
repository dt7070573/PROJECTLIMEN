import { storeItems as rawStoreItems } from '../storeItems.js'
import { crewSeed as rawCrew, messageTemplates as rawTemplates } from '../socialData.js'

export const storeItems = rawStoreItems.map((item) => ({
  ...item,
  type: item.type ?? 'consumable',
  slot: item.slot ?? null,
  effects: item.effects ?? {},
}))

export const crewSeed = {
  ...rawCrew,
  notice: rawCrew.notice ?? rawCrew.notices?.[0]?.text ?? rawCrew.motto ?? '',
  members: (rawCrew.members ?? []).map((member) => ({ ...member, role: member.role ?? member.status ?? '작업반원' })),
  goal: rawCrew.goal ?? rawCrew.weeklyGoal,
}

export const messageTemplates = rawTemplates.subject.flatMap((subject, index) => [{
  id: `structured-${index}`,
  label: subject,
  text: `${subject} ${rawTemplates.observation[index % rawTemplates.observation.length]}. ${rawTemplates.advice[index % rawTemplates.advice.length]}. (${rawTemplates.certainty[index % rawTemplates.certainty.length]})`,
}])

export const systemContentSource = { store: 'local-data', social: 'local-data' }
