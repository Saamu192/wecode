import numberFormatter, {durationFormatter} from '../../util/number-formatter'

export const METRIC_MAPPING = {
  'Visitantes únicos (últimos 30 min)': 'visitors',
  'Visualizações por página (últimos 30 min)': 'pageviews',
  'Visitantes únicos': 'visitors',
  'Duração da visita': 'visit_duration',
  'Totais de visualizações': 'pageviews',
  'Visualizações por visita': 'views_per_visit',
  'Total de visitas': 'visits',
  'Taxa de rejeição': 'bounce_rate',
  'Conversões': 'conversions',
}

export const METRIC_LABELS = {
  'visitors': 'Visitantes',
  'pageviews': 'Visualizações por página',
  'views_per_visit': 'Visualizações por visita',
  'visits': 'Total de visitas',
  'bounce_rate': 'Taxa de rejeição',
  'visit_duration': 'Duração da visita',
  'conversions': 'Visitantes convertidos',
}

export const METRIC_FORMATTER = {
  'visitors': numberFormatter,
  'pageviews': numberFormatter,
  'visits': numberFormatter,
  'views_per_visit': (number) => (number),
  'bounce_rate': (number) => (`${number}%`),
  'visit_duration': durationFormatter,
  'conversions': numberFormatter,
}

export const LoadingState = {
  loading: 'loading',
  refreshing: 'refreshing',
  loaded: 'loaded',
  isLoadingOrRefreshing: function (state) { return [this.loading, this.refreshing].includes(state) },
  isLoadedOrRefreshing: function (state) { return [this.loaded, this.refreshing].includes(state) }
}

const buildComparisonDataset = function(comparisonPlot) {
  if (!comparisonPlot) return []

  return [{
    data: comparisonPlot,
    borderColor: 'rgba(60,109,60, 0.2)',
    pointBackgroundColor: 'rgba(60,109,60, 0.2)',
    pointHoverBackgroundColor: 'rgba(60, 109, 60)',
    yAxisID: 'yComparison',
  }]
}

const buildDashedDataset = function(plot, presentIndex) {
  if (!presentIndex) return []

  const dashedPart = plot.slice(presentIndex - 1, presentIndex + 1);
  const dashedPlot = (new Array(presentIndex - 1)).concat(dashedPart)

  return [{
    data: dashedPlot,
    borderDash: [3, 3],
    borderColor: 'rgba(76,116,104)',
    pointHoverBackgroundColor: 'rgba(0, 100, 37)',
    yAxisID: 'y',
  }]
}

const buildMainPlotDataset = function(plot, presentIndex) {
  const data = presentIndex ? plot.slice(0, presentIndex) : plot

  return [{
    data: data,
    borderColor: 'rgba(0, 190, 37)',
    pointBackgroundColor: 'rgba(0, 190, 37)',
    pointHoverBackgroundColor: 'rgba(71, 194, 71)',
    yAxisID: 'y',
  }]
}

export const buildDataSet = (plot, comparisonPlot, present_index, ctx, label) => {
  var gradient = ctx.createLinearGradient(0, 0, 0, 300);
  var prev_gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(0, 190, 37, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 190, 37, 0)');
  prev_gradient.addColorStop(0, 'rgba(0, 190, 37, 0.075)');
  prev_gradient.addColorStop(1, 'rgba(0, 190, 37, 0)');

  const defaultOptions = { label, borderWidth: 3, pointBorderColor: "transparent", pointHoverRadius: 4, backgroundColor: gradient, fill: true }

  const dataset = [
    ...buildMainPlotDataset(plot, present_index),
    ...buildDashedDataset(plot, present_index),
    ...buildComparisonDataset(comparisonPlot)
  ]

  return dataset.map((item) => Object.assign(item, defaultOptions))
}
