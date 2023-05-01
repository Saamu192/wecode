export const FILTER_GROUPS = {
  'page': ['page', 'entry_page', 'exit_page'],
  'source': ['source', 'referrer'],
  'location': ['country', 'region', 'city'],
  'screen': ['screen'],
  'browser': ['browser', 'browser_version'],
  'os': ['os', 'os_version'],
  'utm': ['utm_medium', 'utm_source', 'utm_campaign', 'utm_term', 'utm_content'],
  'goal': ['goal'],
  'props': ['prop_key', 'prop_value']
}

export const FILTER_TYPES = {
  isNot: 'não é',
  contains: 'contém',
  is: 'é'
};

export const FILTER_PREFIXES = {
  [FILTER_TYPES.isNot]: '!',
  [FILTER_TYPES.contains]: '~',
  [FILTER_TYPES.is]: ''
};

export function supportsIsNot(filterName) {
  return !['goal', 'prop_key'].includes(filterName)
}

export function isFreeChoiceFilter(filterName) {
  return FILTER_GROUPS['page'].concat(FILTER_GROUPS['utm']).includes(filterName)
}

// As of March 2023, Safari does not support negative lookbehind regexes. In case it throws an error, falls back to plain | matching. This means
// escaping pipe characters in filters does not currently work in Safari
let NON_ESCAPED_PIPE_REGEX;
try {
  NON_ESCAPED_PIPE_REGEX = new RegExp("(?<!\\\\)\\|", "g")
} catch(_e) {
  NON_ESCAPED_PIPE_REGEX = '|'
}

const ESCAPED_PIPE = '\\|'

export function escapeFilterValue(value) {
  return value.replaceAll(NON_ESCAPED_PIPE_REGEX, ESCAPED_PIPE)
}

export function toFilterQuery(type, clauses) {
  const prefix = FILTER_PREFIXES[type];
  const result = clauses.map(clause => escapeFilterValue(clause.value.trim())).join('|')
  return prefix + result;
}

function parsePrefix(rawValue) {
  const type = Object.keys(FILTER_PREFIXES)
    .find(type => FILTER_PREFIXES[type] === rawValue[0]) || FILTER_TYPES.is;

  const value = [FILTER_TYPES.isNot, FILTER_TYPES.contains].includes(type)
    ? rawValue.substring(1)
    : rawValue;

  const values = value
    .split(NON_ESCAPED_PIPE_REGEX)
    .filter((clause) => !!clause)
    .map((val) => val.replaceAll(ESCAPED_PIPE, '|'))

  return {type, values}
}

export function parseQueryFilter(query, filter) {
  if (filter === 'props') {
    const rawValue = query.filters['props']
    const [[_propKey, propVal]] = Object.entries(rawValue)
    const {type, values} = parsePrefix(propVal)
    const clauses = values.map(val => { return {value: val, label: val}})
    return {type, clauses}
  } else {
    const {type, values} = parsePrefix(query.filters[filter] || '')

    let labels = values

    if (filter === 'country' && values.length > 0) {
      const rawLabel = (new URLSearchParams(window.location.search)).get('country_labels') || ''
      labels = rawLabel.split('|').filter(label => !!label)
    }

    if (filter === 'region' && values.length > 0) {
      const rawLabel = (new URLSearchParams(window.location.search)).get('region_labels') || ''
      labels = rawLabel.split('|').filter(label => !!label)
    }

    if (filter === 'city' && values.length > 0) {
      const rawLabel = (new URLSearchParams(window.location.search)).get('city_labels') || ''
      labels = rawLabel.split('|').filter(label => !!label)
    }

    const clauses = values.map((value, index) => { return {value, label: labels[index]}})

    return {type, clauses}
  }
}

export function formatFilterGroup(filterGroup) {
  if (filterGroup === 'utm') {
    return 'UTM Tags'
  } else if (filterGroup === 'location') {
    return 'Localização'
  } else if (filterGroup === 'props') {
    return 'Propriedade'
  } else {
    return formattedFilters[filterGroup]
  }
}

export function filterGroupForFilter(filter) {
  const map = Object.entries(FILTER_GROUPS).reduce((filterToGroupMap, [group, filtersInGroup]) => {
    const filtersToAdd = {}
    filtersInGroup.forEach((filterInGroup) => {
      filtersToAdd[filterInGroup] = group
    })

    return { ...filterToGroupMap, ...filtersToAdd }
  }, {})


  return map[filter] || filter
}

export const formattedFilters = {
  'goal': 'Métrica',
  'props': 'Propriedade',
  'prop_key': 'Propriedade',
  'prop_value': 'Valor',
  'source': 'Fonte',
  'utm_medium': 'Mídias UTM',
  'utm_source': 'Fontes UTM',
  'utm_campaign': 'Campanhas UTM',
  'utm_content': 'Conteúdo UTM',
  'utm_term': 'Termo UTM',
  'referrer': 'Referência URL',
  'screen': 'Dispositivo',
  'browser': 'Navegador',
  'browser_version': 'Versão do navegador',
  'os': 'Sistema Operacional',
  'os_version': 'Versão do sistema operacional',
  'country': 'País',
  'region': 'Região',
  'city': 'Cidade',
  'page': 'Página',
  'entry_page': 'Página de entrada',
  'exit_page': 'Página de saída'
}
