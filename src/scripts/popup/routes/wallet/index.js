import React from 'react'
import { connect, bindActions } from '~/store'
import { push } from 'connected-react-router'
import Component from './renderer'

@connect(
  state => ({
    wallet: state.app.Vault.get('vault').wallets[0],
  }),
  dispatch =>
    bindActions(
      {
        goToVaultPassword: () => push('/vault-password'),
      },
      dispatch
    )
)
export default class Route extends React.Component {
  onAddressClick() {
    // Copy
    document.oncopy = event => {
      event.clipboardData.setData('text/plain', this.props.wallet.address)
      event.preventDefault()
    }
    document.execCommand('copy', false, null)
  }

  render() {
    const identicon = `https://api.adorable.io/avatars/128/${
      this.props.wallet.address
    }.png`
    return (
      <Component
        wallet={this.props.wallet}
        identicon={identicon}
        onAddressClick={this.onAddressClick.bind(this)}
      />
    )
  }
}
