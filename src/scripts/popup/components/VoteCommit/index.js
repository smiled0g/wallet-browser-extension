import React from 'react'
import Component from './renderer'
import { connect, bindActions } from '~/store'
import { query } from '~/store/app/Vault/action'
import { Promise } from 'core-js'
import { TokenBalance } from '~/store/utils/token-balance'
import { commitTxn } from '~/store/app/Vault/action'
import { updateVote, removeVote } from '~/store/app/VoteCommit/action'

@connect(
  undefined,
  dispatch =>
    bindActions({ query, commitTxn, updateVote, removeVote }, dispatch)
)
export default class Vote extends React.Component {
  state = {
    period: null,
    result: null,
    commit_end_time: null,
    reveal_end_time: null,
    vote_against: null,
    vote_for: null,
  }

  async componentDidMount() {
    const { voting_address, vote, query } = this.props
    const { poll_id } = vote
    const [
      period,
      result,
      commit_end_time,
      reveal_end_time,
      vote_against,
      vote_for,
    ] = await Promise.all([
      query('Voting', voting_address, 'get_period', poll_id),
      query('Voting', voting_address, 'get_result', poll_id),
      query('Voting', voting_address, 'get_commit_end_time', poll_id),
      query('Voting', voting_address, 'get_reveal_end_time', poll_id),
      query('Voting', voting_address, 'get_vote_against', poll_id),
      query('Voting', voting_address, 'get_vote_for', poll_id),
    ])

    this.setState({
      period: period.toNumber(),
      result,
      commit_end_time: commit_end_time.toNumber(),
      reveal_end_time: reveal_end_time.toNumber(),
      vote_against: TokenBalance.fromSmallUnitBigNumber(
        vote_against
      ).toUnitString(),
      vote_for: TokenBalance.fromSmallUnitBigNumber(vote_for).toUnitString(),
    })
  }

  async onClaimReward() {
    //
  }

  async onRevealVote() {
    const { vote, voting_address, updateVote, commitTxn } = this.props
    await commitTxn(
      'Voting',
      voting_address,
      'reveal_vote',
      vote.poll_id,
      vote.choice,
      vote.nonce
    )

    const newVote = {
      ...vote,
      revealed: true,
    }
    updateVote(vote.id, newVote)
  }

  async onRescueToken() {
    const { vote, voting_address, updateVote, commitTxn } = this.props
    console.log('RESCUE TOKENS')
    await commitTxn('Voting', voting_address, 'rescue_token', vote.poll_id)

    const newVote = {
      ...vote,
      rescued: true,
    }
    updateVote(vote.id, newVote)
  }

  async onDismiss() {
    const { vote, removeVote } = this.props
    removeVote(vote.id)
  }

  render() {
    console.log('STTE', this.state, this.props.vote)
    return (
      <Component
        vote={this.props.vote}
        {...this.state}
        onDismiss={this.onDismiss.bind(this)}
        onClaimReward={this.onClaimReward.bind(this)}
        onRevealVote={this.onRevealVote.bind(this)}
        onRescueToken={this.onRescueToken.bind(this)}
      />
    )
  }
}
