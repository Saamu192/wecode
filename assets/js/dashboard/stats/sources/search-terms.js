import React from 'react';
import FadeIn from '../../fade-in'
import Bar from '../bar'
import MoreLink from '../more-link'
import numberFormatter from '../../util/number-formatter'
import RocketIcon from '../modals/rocket-icon'
import * as api from '../../api'
import LazyLoader from '../../components/lazy-loader'

export default class SearchTerms extends React.Component {
  constructor(props) {
    super(props)
    this.state = {loading: true}
    this.onVisible = this.onVisible.bind(this)
    this.fetchSearchTerms = this.fetchSearchTerms.bind(this)
  }

  onVisible() {
    this.fetchSearchTerms()
    if (this.props.query.period === 'realtime') {
      document.addEventListener('tick', this.fetchSearchTerms)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.setState({loading: true, terms: null})
      this.fetchSearchTerms()
    }
  }

  componentWillUnmount() {
    document.removeEventListener('tick', this.fetchSearchTerms)
  }

  fetchSearchTerms() {
    api.get(`/api/stats/${encodeURIComponent(this.props.site.domain)}/referrers/Google`, this.props.query)
      .then((res) => this.setState({
        loading: false,
        searchTerms: res.search_terms || [],
        notConfigured: res.not_configured,
        isAdmin: res.is_admin
      })).catch((error) =>
        {
            this.setState({ loading: false, searchTerms: [], notConfigured: true, error: true, isAdmin: error.payload.is_admin })
        }
      )
  }

  renderSearchTerm(term) {
    return (
      <div className="flex items-center justify-between my-1 text-sm" key={term.name}>
        <Bar
          count={term.visitors}
          all={this.state.searchTerms}
          bg="bg-blue-50 dark:bg-gray-500 dark:bg-opacity-15"
          maxWidthDeduction="4rem"
        >
          <span className="flex px-2 py-1.5 dark:text-gray-300 z-9 relative break-all">
            <span className="md:truncate block">
              { term.name }
            </span>
          </span>
        </Bar>
        <span className="font-medium dark:text-gray-200">{numberFormatter(term.visitors)}</span>
      </div>
    )
  }

  renderList() {
    if (this.props.query.filters.goal) {
      return (
        <div className="text-center text-gray-700 dark:text-gray-300 text-sm mt-20">
          <RocketIcon />
          <div>Desculpe, não podemos mostrar quais palavras-chave converteram melhor para meta <b>{this.props.query.filters.goal}</b></div>
          <div>O Google não compartilha essas informações</div>
        </div>
      )

    } else if (this.state.notConfigured) {
      return (
        <div className="text-center text-gray-700 dark:text-gray-300 text-sm mt-20">
          <RocketIcon />
          <div>
          Este site não está conectado ao Search Console, por isso não podemos mostrar as frases de pesquisa.
          {this.state.isAdmin && this.state.error && <><br/><br/><p>Clique abaixo para conectar sua conta do Search Console.</p></>}
          </div>
          {this.state.isAdmin && <a href={`/${encodeURIComponent(this.props.site.domain)}/settings/search-console`} className="button mt-4">Conecte-se com o Google</a> }
        </div>
      )
    } else if (this.state.searchTerms.length > 0) {
      const valLabel = this.props.query.period === 'realtime' ? 'Visitantes Atuais' : 'Visitantes'

      return (
        <React.Fragment>
          <div className="flex items-center mt-3 mb-2 justify-between text-gray-500 dark:text-gray-400 text-xs font-bold tracking-wide">
            <span>Termo de pesquisa</span>
            <span>{valLabel}</span>
          </div>

          {this.state.searchTerms.map(this.renderSearchTerm.bind(this))}
        </React.Fragment>
      )
    } else {
      return (
        <div className="text-center text-gray-700 dark:text-gray-300 text-sm mt-20">
          <RocketIcon />
          <div>Não foi possível encontrar nenhum termo de pesquisa para este período</div>
          <div>Os dados do Google Search Console são exibidos atrasados em 24-36h</div>
        </div>
      )
    }
  }

  renderContent() {
    if (this.state.searchTerms) {
      return (
        <React.Fragment>
          <h3 className="font-bold dark:text-gray-100">Search Terms</h3>
          { this.renderList() }
          <MoreLink site={this.props.site} list={this.state.searchTerms} endpoint="referrers/Google" />
        </React.Fragment>
      )
    }
  }

  render() {
    return (
      <div
        className="stats-item flex flex-col relative bg-white dark:bg-gray-825 shadow-xl rounded p-4 mt-6 w-full"
      >
        { this.state.loading && <div className="loading mt-44 mx-auto"><div></div></div> }
        <FadeIn show={!this.state.loading} className="flex-grow">
          <LazyLoader onVisible={this.onVisible}>
            { this.renderContent() }
          </LazyLoader>
        </FadeIn>
      </div>
    )
  }
}
