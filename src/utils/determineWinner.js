// utils/determineWinner.js

export function determineWinner({ player, enemy, setDisplayText, setGameState }) {
    if (player.health === enemy.health) {
      setDisplayText('Tie');
    } else if (player.health > enemy.health) {
      setDisplayText('Player 1 Wins');
    } else if (player.health < enemy.health) {
      setDisplayText('Player 2 Wins');
    }
    setGameState('gameOver');
  }
  