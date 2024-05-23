// 扑克牌花色
interface ISuit {
  diamonds: 0 // 方块
  clubs: 1 // 梅花
  hearts: 2 // 红桃
  spades: 3 // 黑桃
}
interface IScore {
  score: number
  type: ICardsType
}

type ISuitLabel = 'diamonds' | 'clubs' | 'hearts' | 'spades'
type ISuitValue = 0 | 1 | 2 | 3
type ICardsType = '豹子' | '同花顺' | '金花' | '顺子' | '对子' | '单张'
type ILabel = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

const SUIT: ISuit = {
  diamonds: 0, // 方块
  clubs: 1, // 梅花
  hearts: 2, // 红桃
  spades: 3 // 黑桃
}

// 思考时间
const THINK_TIME = 1000 * 30
// 总共的牌数
const TOTAL = 13 * 4
const LABELS: ILabel[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
interface ICard {
  suitLabel: ISuitLabel
  suitValue: ISuitValue
  label: ILabel
  value: number
}
interface IPlayer {
  id: number
  name: string
  cards: ICard[]
  score: number
  cardsType?: ICardsType
}
class Game {
  playerNum: number
  deck: ICard[] = []
  players: IPlayer[] = []
  constructor(number: number) {
    this.playerNum = number
    this.setup()
  }

  private randomCard() {
    const index = Math.floor(Math.random() * this.deck.length)
    return this.deck.splice(index, 1)[0]
  }

  private computeScore(cards: ICard[]): IScore {
    cards.sort((a, b) => LABELS.indexOf(a.label) - LABELS.indexOf(b.label))
    let score = 0
    let type: ICardsType
    const suitSet = new Set<ISuitLabel>()
    const labelSet = new Set<ILabel>()
    let isStraight = false
    for (const card of cards) {
      suitSet.add(card.suitLabel)
      labelSet.add(card.label)
    }
    if (cards[2].value - cards[1].value === 1 && cards[1].value - cards[0].value === 1)
      isStraight = true
    //  开始计算牌型分数
    // 1. 处理豹子(555)
    if (labelSet.size === 1) {
      type = '豹子'
      score = 1 << 19
      score += cards[2].value << (4 * 0 + 2)
    }
    // 2. 处理同花顺(567 + 3个黑桃)
    else if (suitSet.size === 1 && isStraight) {
      type = '同花顺'
      score = 1 << 18
      score += cards[0].suitValue << (4 * 1 + 2)
      score += cards[2].value << (4 * 0 + 2)
    }
    // 3. 处理金花(3个黑桃)
    else if (suitSet.size === 1) {
      type = '金花'
      score = 1 << 17
      score += cards[0].suitValue << (4 * 1 + 2)
      score += cards[2].value << (4 * 0 + 2)
    }
    // 4. 处理顺子(567)
    else if (isStraight) {
      type = '顺子'
      score = 1 << 16
      score += cards[2].value << (4 * 0 + 2)
      score += cards[2].suitValue
    }
    // 5. 处理对子(55)
    else if (labelSet.size === 2) {
      type = '对子'
      score = 1 << 15
      let doubleCard: ICard
      let singleCard: ICard
      if (cards[0].label === cards[1].label) {
        doubleCard = cards[0]
        singleCard = cards[2]
      } else if (cards[1].label === cards[2].label) {
        doubleCard = cards[1]
        singleCard = cards[0]
      } else {
        doubleCard = cards[0]
        singleCard = cards[1]
      }
      score += doubleCard.value << (4 * 1 + 2)
      score += singleCard.value << (4 * 0 + 2)
      score += singleCard.suitValue
    }
    // 6. 处理单张(5)
    else {
      type = '单张'
      score = 1 << 14
      score += cards[2].value << (4 * 2 + 2)
      score += cards[1].value << (4 * 1 + 2)
      score += cards[0].value << (4 * 0 + 2)
      score += cards[2].suitValue
    }
    return {
      score,
      type
    }
  }
  start() {
    if (this.players.length) this.setup()
    for (let i = 0; i < this.playerNum; i++) {
      const cards: ICard[] = []
      for (let j = 1; j <= 3; j++) cards.push(this.randomCard())
      const { score, type } = this.computeScore(cards)
      const player = { id: i, name: `player${i + 1}`, cards, score, cardsType: type }
      this.players.push(player)
    }
  }
  computeWinner(): IPlayer {
    let winner = this.players[0]
    for (let i = 1; i < this.players.length; i++)
      if (this.players[i].score > winner.score) winner = this.players[i]
    return winner
  }

  private setup() {
    this.players = []
    this.deck = []
    for (const index in LABELS)
      for (const key in SUIT)
        this.deck.push({
          suitLabel: key as ISuitLabel,
          suitValue: SUIT[key as ISuitLabel],
          label: LABELS[index],
          value: +index
        })
  }
}

export default Game

export type { IPlayer }
