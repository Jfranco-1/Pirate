import Phaser from 'phaser';
import { HubScene } from './scenes/HubScene';
import { GameScene } from './scenes/GameScene';
import { WorldMapScene } from './scenes/WorldMapScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  backgroundColor: '#000000',
  scene: [HubScene, WorldMapScene, GameScene],
  pixelArt: true
};

new Phaser.Game(config);
